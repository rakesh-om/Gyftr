import { redirect } from "react-router";
import { prisma } from "../db.server"; // Prisma client import
import crypto from "crypto";

// export const action = async ({ request }) => {

//   const { encrypted } = await request.json();

//   // 2. Decrypt the data
//   const key = process.env.ENC_DEC_API_KEY;
//   const iv = process.env.ENC_DEC_API_IV_KEY;
//   const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
//   let decrypted = decipher.update(encrypted, "base64", "utf8");
//   decrypted += decipher.final("utf8");
//   const data = JSON.parse(decrypted);

//   // 3. Save to Prisma Setting table
//   const setting = await prisma.setting.create({
//     data: {
//       mid: data.mid,
//       created_at: new Date(),
//       accessToken: data.accessToken,
//       shop: data.shop,
//       brand_name: data.brand_name,
//       enc_dec_api_iv_key: iv,
//       enc_dec_api_key: key,
//       hash_salt: data.hash_salt,
//       password: data.password,
//       reverse_salt: data.reverse_salt,
//       shopid: BigInt(data.shopid),
//       userId: data.userId,
//       user_name: data.user_name,
//     },
//   });

//   // Redirect to app home after saving
//   return redirect("/app");
// };


export const action = async ({ request }) => {
  try {
    const url = new URL(request.url);
    console.log("URL", url)
    const payload = url.searchParams.get("payload"); // GET payload
    console.log("payload",payload)

    if (!payload) {
      return new Response("No payload found", { status: 400 });
    }

    // Decode payload from Base64
    const decodedString = Buffer.from(payload, "base64").toString("utf-8");
    const data = JSON.parse(decodedString);

    // If you want encryption instead (like before), encrypt/decrypt here
    // const key = process.env.ENC_DEC_API_KEY;
    // const iv = process.env.ENC_DEC_API_IV_KEY;
    // const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    // let decrypted = decipher.update(payload, "base64", "utf8");
    // decrypted += decipher.final("utf8");
    // const data = JSON.parse(decrypted);

    // Save to Prisma

    
    
    await prisma.setting.create({
      data: {
        mid: data.mid,
        created_at: new Date(),
        accessToken: data.accessToken,
        shop: data.shop,
        brand_name: data.brand_name,
        enc_dec_api_iv_key: process.env.ENC_DEC_API_IV_KEY,
        enc_dec_api_key: process.env.ENC_DEC_API_KEY,
        hash_salt: data.hash_salt,
        password: data.password,
        reverse_salt: data.reverse_salt,
        shopid: BigInt(data.shopid),
        userId: data.userId,
        user_name: data.user_name,
      },
    });

    // Redirect back to your app
    return redirect("/app");
  } catch (err) {
    console.error(err);
    return new Response("Error processing payload", { status: 500 });
  }
};


export const loader = async () => {
  console.log("Loader called on /app/encurl/callback");
  return redirect("/app");
};