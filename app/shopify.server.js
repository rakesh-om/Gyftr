import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
    DeliveryMethod,
} from "@shopify/shopify-app-react-router/server";
import { MySQLSessionStorage } from "@shopify/shopify-app-session-storage-mysql";
import dotenv from "dotenv";
dotenv.config();

const mysqlUrl = process.env.DATABASE_URL || "mysql://root@localhost:3306/gyftrpay";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  webhooks:{
     APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    }
  },  
 sessionStorage:new MySQLSessionStorage(mysqlUrl),
 distribution: AppDistribution.AppStore,  

   hooks: {
    beforeAuth: async ({ session }) => {
      console.log("Before auth - session:", session); 
    },
    afterAuth: async ({ session }) => {
      console.log("After auth - session:", session);
      try {
        const registration = await shopify.registerWebhooks({ session });
        console.log("Webhook registration result:", registration);
      } catch (error) {
        console.error("Webhook registration error:", error);
      }
    },
  },

  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
