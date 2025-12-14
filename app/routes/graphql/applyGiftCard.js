import { authenticate } from "../../shopify.server";

export async function applyGiftCardToCart(request, cartId, giftCardCode) {
  const { storefront } = await authenticate.storefront(request);
console.log("storefront",storefront)
  console.log("Applying gift card to cart:", cartId, giftCardCode);


  const response = await storefront.graphql(`
    mutation cartGiftCardCodesAdd($cartId: ID!, $giftCardCodes: [String!]!) {
      cartGiftCardCodesAdd(cartId: $cartId, giftCardCodes: $giftCardCodes) {
        cart {
          id
          appliedGiftCards {
            lastCharacters
            amountUsed {
              amount
              currencyCode
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          message
        }
      }
    }
  `, {
    variables: {
      cartId,
      giftCardCodes: [giftCardCode]
    }
  });

  const errors = response.data.cartGiftCardCodesAdd.userErrors;
  if (errors.length) {
    throw new Error(errors[0].message);
  }

  return response.data.cartGiftCardCodesAdd.cart;
}
