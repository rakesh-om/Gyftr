// // shopifyHelpers.js
// import axios from "axios";

// /**
//  * Generates a Shopify Storefront Access Token for a shop
//  * using an id_token from App Proxy.
//  * @param {string} shop - shop domain, e.g., 'example.myshopify.com'
//  * @param {string} idToken - id_token from shop
//  * @returns {Promise<string>} storefront access token
//  */
// export async function getStorefrontAccessToken(shop, idToken) {
//     console.log("shop======",shop)
//   if (!idToken) throw new Error("Missing id_token");

//   // 1️⃣ Exchange id_token for offline access token
//   const tokenResponse = await axios.post(
//     `https://${shop}/admin/oauth/access_token`,
//     {
//       client_id: process.env.SHOPIFY_CLIENT_ID,
//       client_secret: process.env.SHOPIFY_CLIENT_SECRET,
//       grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
//       subject_token: idToken,
//       subject_token_type: "urn:ietf:params:oauth:token-type:id_token",
//       requested_token_type:
//         "urn:shopify:params:oauth:token-type:offline-access-token",
//     },
//     {
//       headers: { "Content-Type": "application/json", Accept: "application/json" },
//     }
//   );

//   console.log("=====")

//   const accessToken = tokenResponse.data.access_token;
//   if (!accessToken) throw new Error("Failed to get Shopify access token");

//   // 2️⃣ Create Storefront Access Token
//   const graphqlQuery = {
//     query: `
//       mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
//         storefrontAccessTokenCreate(input: $input) {
//           userErrors { field message }
//           storefrontAccessToken {
//             accessToken
//           }
//         }
//       }
//     `,
//     variables: {
//       input: { title: "Gyftr Storefront Token" },
//     },
//   };

//   const tokenResult = await axios.post(
//     `https://${shop}/admin/api/2025-10/graphql.json`,
//     graphqlQuery,
//     {
//       headers: {
//         "Content-Type": "application/json",
//         "X-Shopify-Access-Token": accessToken,
//       },
//     }
//   );

//   const userErrors =
//     tokenResult.data?.data?.storefrontAccessTokenCreate?.userErrors || [];
//   if (userErrors.length) {
//     throw new Error(userErrors.map((e) => e.message).join(", "));
//   }

//   const storefrontAccessToken =
//     tokenResult.data?.data?.storefrontAccessTokenCreate?.storefrontAccessToken
//       ?.accessToken;

//   if (!storefrontAccessToken)
//     throw new Error("Failed to create Storefront Access Token");

//   return storefrontAccessToken;
// }



import axios from "axios";

/**
 * Get or create a Shopify Storefront access token using Admin API.
 * @param {string} shop - shop.myshopify.com
 * @param {string} adminToken - offline access token
 * @returns {Promise<string>} storefront access token
 */
export async function getStorefrontAccessToken(shop, adminToken) {
  const query = `
    mutation StorefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
      storefrontAccessTokenCreate(input: $input) {
        userErrors { field message }
        storefrontAccessToken { accessToken }
      }
    }
  `;

  const variables = { input: { title: "Gyftr Storefront Token" } };

  const response = await axios.post(
    `https://${shop}/admin/api/2025-10/graphql.json`,
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
    }
  );

  const data = response.data;

  if (data.errors) throw new Error(JSON.stringify(data.errors));
  if (data.data.storefrontAccessTokenCreate.userErrors.length) {
    throw new Error(data.data.storefrontAccessTokenCreate.userErrors[0].message);
  }

  return data.data.storefrontAccessTokenCreate.storefrontAccessToken.accessToken;
}
