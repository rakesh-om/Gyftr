
import axios from "axios";
import { getStorefrontAccessToken } from "./getStorefrontAccessToken";
import { authenticate } from "../../shopify.server";
import { prisma } from "../../db.server";

/**
 * Apply gift card to cart
 * @param {Request} request - Remix request
 * @param {string} cartId - gid://shopify/Cart/xxxx
 * @param {string} giftCardCode
 */
export async function applyGiftCardToCart(request, cartId, giftCardCode) {
  console.log("Applying gift card to cart:", { cartId, giftCardCode });
  // 1️⃣ Get shop & offline token from app proxy session
  const { session } = await authenticate.public.appProxy(request);

  if (!session?.accessToken) throw new Error("Missing offline access token");

  const offlineToken = session.accessToken;
  const shop = session.shop;

  console.log("Offline token:", offlineToken);

    // 1️⃣ Get the saved storefront access token from DB
    const shopifySession = await prisma.shopify_sessions.findUnique({
      where: { id: session.id },
      select: { storefront_access_token: true },
    });
    console.log("Shopify session from DB:", shopifySession);

  // 2️⃣ Optional: Get Storefront token if needed
  // const storefrontToken = await getStorefrontAccessToken(shop, offlineToken);
  console.log("Storefront token:", shopifySession);
  const STOREFRONT_ACCESS_TOKEN= shopifySession.storefront_access_token;

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
  console.log("GraphQL variables:", variables);

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
