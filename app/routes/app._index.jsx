import { useEffect, useRef } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import crypto from "crypto";
import { prisma } from "../db.server";

// import { db } from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const shop = session.shop;
  const host = url.searchParams.get("host");
  console.log("Shop==", shop);

  // 2️⃣ Session check
  const shopSession = await prisma.shopify_sessions.findUnique({
    where: { id: session.id },
    select: { onboarded: true },
  });

  console.log("shopSession", shopSession);

  if (!shopSession?.onboarded) {
    console.log("Called===");
    // Redirect ONCE to onboarding route
    const thirdPartyUrl = `http://127.0.0.1:5500/index.html?host=${host}&shop=${session.shop}`;

    await prisma.shopify_sessions.update({
      where: { id: session.id },
      data: { onboarded: true },
    });

    return {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      redirectUrl: thirdPartyUrl,
    };
  }

  const encryptedData = url.searchParams.get("encryptedData");
  console.log("encryptedData", encryptedData);
  if (!encryptedData) {
    console.log("No encryptedData, normal app load");
    return null;
  }

  const [rows] = await prisma.$queryRaw`
    SELECT onboarded FROM shopify_sessions WHERE id = ${session.id}
  `;

  

  const key = "7TloC0pRacfxOA2rlXURmFLYCLl7wdPj";
  const iv = "5819061549973285";

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");

  const data = JSON.parse(decrypted);

   console.log("data==",data)

  // 5️⃣ SAVE ONLY ONCE (check by shop)
  const existingSetting = await prisma.setting.findUnique({
    where: { shop: session.shop },
  });

  console.log("existingSetting",existingSetting)

  if (!existingSetting) {
    console.log("Inside")
    await prisma.setting.create({
      data: {
        shop: session.shop,
        mid: data.mid,
        accessToken: data.accessToken,
        brand_name: data.brand_name,
        enc_dec_api_iv_key: key,
        enc_dec_api_key: iv,
        hash_salt: data.hash_salt,
        password: data.password,
        reverse_salt: data.reverse_salt,
        shopid: BigInt(data.shopid),
        userId: data.userId,
        user_name: data.user_name,
        created_at: new Date(),
      },
    });
  }

  // 6️⃣ Mark onboarded AFTER save
  // await prisma.shopify_sessions.update({
  //   where: { id: session.id },
  //   data: { onboarded: true },
  // });
  // await prisma.Setting.create({
  //   data: {
  //     mid: data.mid,
  //     created_at: new Date(),
  //     accessToken: data.accessToken,
  //     shop: data.shop,
  //     brand_name: data.brand_name,
  //     enc_dec_api_iv_key: key.toString(),
  //     enc_dec_api_key: iv.toString(),
  //     hash_salt: data.hash_salt,
  //     password: data.password,
  //     reverse_salt: data.reverse_salt,
  //     shopid: BigInt(data.shopid),
  //     userId: data.userId,
  //     user_name: data.user_name,
  //   },
  // });

  // await prisma.$executeRaw`
  //   UPDATE shopify_sessions SET onboarded = 1 WHERE id = ${session.id}
  // `;

  console.log("Onboarding completed successfully");

  return { redirectUrl: null };

};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
const { redirectUrl } = useLoaderData() || {};

  const hasRedirected = useRef(false);

  useEffect(() => {
    if (redirectUrl && !hasRedirected.current) {
      hasRedirected.current = true;
      window.open(redirectUrl, "_blank");
    }
  }, [redirectUrl]);
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.product?.id) {
      shopify.toast.show("Product created");
    }
  }, [fetcher.data?.product?.id, shopify]);
  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  return (
    <s-page heading="Shopify app template">
      <s-button slot="primary-action" onClick={generateProduct}>
        Generate a product
      </s-button>

      <s-section heading="Congrats on creating a new Shopify app 🎉">
        <s-paragraph>
          This embedded app template uses{" "}
          <s-link
            href="https://shopify.dev/docs/apps/tools/app-bridge"
            target="_blank"
          >
            App Bridge
          </s-link>{" "}
          interface examples like an{" "}
          <s-link href="/app/additional">additional page in the app nav</s-link>
          , as well as an{" "}
          <s-link
            href="https://shopify.dev/docs/api/admin-graphql"
            target="_blank"
          >
            Admin GraphQL
          </s-link>{" "}
          mutation demo, to provide a starting point for app development.
        </s-paragraph>
      </s-section>
      <s-section heading="Get started with products">
        <s-paragraph>
          Generate a product with GraphQL and get the JSON output for that
          product. Learn more about the{" "}
          <s-link
            href="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
            target="_blank"
          >
            productCreate
          </s-link>{" "}
          mutation in our API references.
        </s-paragraph>
        <s-stack direction="inline" gap="base">
          <s-button
            onClick={generateProduct}
            {...(isLoading ? { loading: true } : {})}
          >
            Generate a product
          </s-button>
          {fetcher.data?.product && (
            <s-button
              onClick={() => {
                shopify.intents.invoke?.("edit:shopify/Product", {
                  value: fetcher.data?.product?.id,
                });
              }}
              target="_blank"
              variant="tertiary"
            >
              Edit product
            </s-button>
          )}
        </s-stack>
        {fetcher.data?.product && (
          <s-section heading="productCreate mutation">
            <s-stack direction="block" gap="base">
              <s-box
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <pre style={{ margin: 0 }}>
                  <code>{JSON.stringify(fetcher.data.product, null, 2)}</code>
                </pre>
              </s-box>

              <s-heading>productVariantsBulkUpdate mutation</s-heading>
              <s-box
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <pre style={{ margin: 0 }}>
                  <code>{JSON.stringify(fetcher.data.variant, null, 2)}</code>
                </pre>
              </s-box>
            </s-stack>
          </s-section>
        )}
      </s-section>

      <s-section slot="aside" heading="App template specs">
        <s-paragraph>
          <s-text>Framework: </s-text>
          <s-link href="https://reactrouter.com/" target="_blank">
            React Router
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Interface: </s-text>
          <s-link
            href="https://shopify.dev/docs/api/app-home/using-polaris-components"
            target="_blank"
          >
            Polaris web components
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>API: </s-text>
          <s-link
            href="https://shopify.dev/docs/api/admin-graphql"
            target="_blank"
          >
            GraphQL
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-text>Database: </s-text>
          <s-link href="https://www.prisma.io/" target="_blank">
            Prisma
          </s-link>
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="Next steps">
        <s-unordered-list>
          <s-list-item>
            Build an{" "}
            <s-link
              href="https://shopify.dev/docs/apps/getting-started/build-app-example"
              target="_blank"
            >
              example app
            </s-link>
          </s-list-item>
          <s-list-item>
            Explore Shopify&apos;s API with{" "}
            <s-link
              href="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
              target="_blank"
            >
              GraphiQL
            </s-link>
          </s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
