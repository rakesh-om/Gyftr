import { authenticate } from "../../shopify.server";

export async function createGiftCard(request, amount, note) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    mutation giftCardCreate($input: GiftCardCreateInput!) {
      giftCardCreate(input: $input) {
        giftCard {
          id
          code
          balance {
            amount
            currencyCode
          }
        }
        userErrors {
          message
        }
      }
    }
  `, {
    variables: {
      input: {
        initialValue: parseFloat(amount),
        note
      }
    }
  });

  const result = response.data.giftCardCreate;

  if (result.userErrors.length) {
    throw new Error(result.userErrors[0].message);
  }

  return result.giftCard;
}
