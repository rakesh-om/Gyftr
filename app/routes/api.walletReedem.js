import { createGiftCard } from "./graphql/createGiftCard";
import { applyGiftCardToCart } from "./graphql/applyGiftCard";
import { callGyftrWallet } from "./gyfter/GyftrWalletReedem";

export const loader = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, userid, password",
    },
  });
};

export const action = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("wallet-reedem body===", body);
    const headers = Object.fromEntries(request.headers);
  
    const parsed = await callGyftrWallet(headers, body);

    
    if (parsed.CODE !== "00") {
      return new Response(
        JSON.stringify({
          success: false,
          message: parsed.MESSAGE,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // const { cartId } = body;
    const cartId = `gid://shopify/Cart/${body.CARTID}`;
    if (!cartId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "cartId required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // console.log("parsed==",parsed)

    const giftCard = await createGiftCard(request, parsed.AMOUNT, parsed.TXNID);

    let cartData = null;
    if (giftCard && giftCard.id && giftCard.maskedCode) {
      cartData = await applyGiftCardToCart(request, cartId, parsed.TXNID);
    } else {
      throw new Error("Gift card not valid, skipping applyGiftCardToCart");
    }


    console.log("cartData=======",cartData)



    return new Response(
      JSON.stringify({
        success: true,
        giftCard: {
          code: giftCard.maskedCode ,
          amount: giftCard.initialValue.amount,
        },
        cartData,
        parsed

      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("wallet-redemption error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Internal Server Error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
};
