import { createGiftCard } from "./graphql/createGiftCard";
import  applyGiftCardToCart from "./graphql/applyGiftCard";
import { callGyftrWallet } from "./gyfter/GyftrWalletReedem";

export const action = async ({ request }) => {
  try {
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);

    const parsed = await callGyftrWallet(headers, body);

    if (parsed.CODE !== "00") {
      return json({ success: false, message: parsed.MESSAGE }, { status: 400 });
    }

    const { cartId } = body;
    if (!cartId) {
      return json(
        { success: false, message: "cartId required" },
        { status: 400 },
      );
    }

    // 1️⃣ Create Gift Card
    const giftCard = await createGiftCard(
      request,
      parsed.AMOUNT,
      `GyFTR TXN ${parsed.TXNID}`,
    );

    // 2️⃣ Apply Gift Card to Cart
    const cart = await applyGiftCardToCart(request, cartId, giftCard.code);

    return {
      success: true,
      giftCard: {
        code: giftCard.code,
        amount: parsed.AMOUNT,
      },
      cart,
    };
  } catch (error) {
    console.error("wallet-redemption error:", error);
    return (
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
};
