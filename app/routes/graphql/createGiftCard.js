import { authenticate } from "../../shopify.server";

export async function createGiftCard(request, amount,code) {
  console.log("createGiftCard called",request,amount, code);
  const { session, admin } = await authenticate.public.appProxy(request);


  console.log("createGiftCard called");

  const response = await admin.graphql(`
    mutation giftCardCreate($input: GiftCardCreateInput!) {
      giftCardCreate(input: $input) {
        giftCard {
          id
          maskedCode
        initialValue {
          amount
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
        code:code,
      }
    }
  });
const json = await response.json();
console.log("json===",json)

  const result = json.data?.giftCardCreate;
  console.log("Result==",result)

  if (!result) {
    throw new Error("giftCardCreate returned null");
  }

  if (result.userErrors && result.userErrors.length > 0) {
    throw new Error(result.userErrors[0].message);
  }

  return result.giftCard;
}
