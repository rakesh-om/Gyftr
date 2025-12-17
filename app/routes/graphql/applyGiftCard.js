// import { getStorefrontAccessToken } from "./getStorefrontAccessToken";
// import { authenticate } from "../../shopify.server";

// export async function applyGiftCardToCart(request, cartId, giftCardCode) {
//   // 1️⃣ Extract shop & id_token from App Proxy
//   const { session, admin } = await authenticate.public.appProxy(request);
//   console.log("session",session)
//   const idToken = session.accessToken; // ya url params se

//   if (!idToken) throw new Error("Missing id_token for gift card");


//   console.log("==========================")

//   // 2️⃣ Get storefront token
//   const storefrontToken = await getStorefrontAccessToken(session.shop, idToken);
//   console.log("storefrontToken",storefrontToken)

//   // 3️⃣ Use Admin API (aapka existing code) or Storefront API
//   const response = await admin.graphql(
//     `
//     mutation cartGiftCardCodesAdd($cartId: ID!, $giftCardCodes: [String!]!) {
//       cartGiftCardCodesAdd(cartId: $cartId, giftCardCodes: $giftCardCodes) {
//         cart {
//           id
//           appliedGiftCards {
//             lastCharacters
//             amountUsed {
//               amount
//               currencyCode
//             }
//           }
//           cost {
//             totalAmount {
//               amount
//               currencyCode
//             }
//           }
//         }
//         userErrors {
//           message
//         }
//       }
//     }
//   `,
//     {
//       variables: { cartId, giftCardCodes: [giftCardCode] },
//     }
//   );

//   const errors = response.data.cartGiftCardCodesAdd.userErrors;
//   if (errors.length) throw new Error(errors[0].message);

//   return response.data.cartGiftCardCodesAdd.cart;
// }


import axios from "axios";
import { getStorefrontAccessToken } from "./getStorefrontAccessToken";
import { authenticate } from "../../shopify.server";

/**
 * Apply gift card to cart
 * @param {Request} request - Remix request
 * @param {string} cartId - gid://shopify/Cart/xxxx
 * @param {string} giftCardCode
 */
export async function applyGiftCardToCart(request, cartId, giftCardCode) {
  // 1️⃣ Get shop & offline token from app proxy session
  const { session } = await authenticate.public.appProxy(request);

  if (!session?.accessToken) throw new Error("Missing offline access token");

  const offlineToken = session.accessToken;
  const shop = session.shop;

  console.log("Offline token:", offlineToken);

  // 2️⃣ Optional: Get Storefront token if needed
  const storefrontToken = await getStorefrontAccessToken(shop, offlineToken);
  console.log("Storefront token:", storefrontToken);
  const STOREFRONT_ACCESS_TOKEN= storefrontToken

  // 3️⃣ Apply gift card using Admin GraphQL API
  const query = `
    mutation cartGiftCardCodesAdd($cartId: ID!, $giftCardCodes: [String!]!) {
      cartGiftCardCodesAdd(cartId: $cartId, giftCardCodes: $giftCardCodes) {
        cart {
          id
          appliedGiftCards {
            lastCharacters
            amountUsed { amount currencyCode }
          }
          cost { totalAmount { amount currencyCode } }
        }
        userErrors { message }
      }
    }
  `;

  const variables = { cartId, giftCardCodes: [giftCardCode] };

const response = await axios.post(
  `https://${shop}/api/2025-10/graphql.json`,
  { query, variables },
  {
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
    },
  }
);

console.log("Response====",response)

  const errors = response.data.data.cartGiftCardCodesAdd.userErrors;
  if (errors.length) throw new Error(errors[0].message);

  return response.data.data.cartGiftCardCodesAdd.cart;
}
