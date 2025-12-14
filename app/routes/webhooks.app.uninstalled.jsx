import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Delete ALL sessions for this shop
  await db.shopify_sessions.deleteMany({
    where: { shop },
  });

  return new Response();
};
