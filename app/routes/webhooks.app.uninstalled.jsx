import { authenticate } from "../shopify.server";
import db, { prisma } from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Set tokens to null and onboarded to false for this shop
  console.log("Clearing tokens and resetting onboarded status for shop:", shop);
  await prisma.shopify_sessions.updateMany({
    where: { shop },
    data: {
      accessToken: null,
      storefront_access_token: null,
      onboarded: false,
    },

  });

  return new Response();
};