  import { Outlet, useLoaderData, useRouteError } from "react-router";
  import { boundary } from "@shopify/shopify-app-react-router/server";
  import { AppProvider } from "@shopify/shopify-app-react-router/react";
  import { authenticate } from "../shopify.server";
  // import { useEffect, useRef } from "react";
  // import { db } from "../db.server.js";
  // import { encrypt } from "./helper/crypto";

  // export const loader = async ({ request }) => {
  //   console.log("request==",request)
  //   console.log("Loader called");
  //   const { session } = await authenticate.admin(request);
  //   const shop = session.shop;
  //   const shopid = session.id;
  //   const url = new URL(request.url);
  //   const host = url.searchParams.get("host");
  //   const key = process.env.GYFTR_KEY
  //   const iv = process.env.GYFTR_IV


  //   console.log("Dynamic Host:", host);

  //   // Debugging
  //   console.log("shop:", shop, "session:", session);
    


  // // const encryptedSession = await encrypt(session.accessToken, key, iv )
  // // console.log("encryptedSession",encryptedSession)

  //   // const thirdPartyUrl = `https://demo7.ciadmin.in/encurl?host=${host}&shop=${shop}`;
  //   const thirdPartyUrl = `http://127.0.0.1:5500/index.html?host=${host}&shop=${shop}`;

    

  //   // Find session in shopify_sessions table
  //   const [rows] = await db.query(
  //     "SELECT * FROM shopify_sessions WHERE id = ?",
  //     [session.id]
  //   );
  //   let dbSession = rows[0];

  //   // If not found, create a new session record (optional, usually handled by Shopify adapter)
  //   if (!dbSession) {
  //     await db.query(
  //       "INSERT INTO shopify_sessions (id, shop, state, isOnline, scope, accessToken) VALUES (?, ?, ?, ?, ?, ?)",
  //       [
  //         session.id,
  //         shop,
  //         session.state || "",
  //         session.isOnline || false,
  //         session.scope || "",
  //         session.accessToken || "",
  //       ]
  //     );
  //     dbSession = {
  //       id: session.id,
  //       shop,
  //       onboarded: false,
  //     };
  //   }

  //   // if (!dbSession.onboarded) {
  //   //   await db.query(
  //   //     "UPDATE shopify_sessions SET onboarded = ? WHERE id = ?",
  //   //     [true, session.id]
  //   //   );
  //   //   return { apiKey: process.env.SHOPIFY_API_KEY || "", redirectUrl: thirdPartyUrl };
  //   // }

  //   if (!dbSession.onboarded) {
  //   return {
  //     apiKey: process.env.SHOPIFY_API_KEY || "",
  //     redirectUrl: thirdPartyUrl,
  //   };
  // }


  //   return { apiKey: process.env.SHOPIFY_API_KEY || "" };
  // };


  export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
  };
};


  export default function App() {
    const { apiKey, redirectUrl } = useLoaderData();
    // const hasRedirected = useRef(false);

    // useEffect(() => {
    //   if (redirectUrl && !hasRedirected.current) {
    //     hasRedirected.current = true;
    //     window.open(redirectUrl, "_blank");
    //   }
    // }, [redirectUrl]);

    return (
      <AppProvider embedded apiKey={apiKey}>
        <s-app-nav>
          <s-link href="/app">Home</s-link>
          <s-link href="/app/additional">Additional page</s-link>
        </s-app-nav>
        <Outlet />
      </AppProvider>
    );
  }

  export function ErrorBoundary() {
    return boundary.error(useRouteError());
  }

  export const headers = (headersArgs) => {
    return boundary.headers(headersArgs);
  };