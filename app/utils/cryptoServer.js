import crypto from "crypto";

const SECRET_KEY = process.env.SECRET_KEY;  // 32 chars
const IV = process.env.IV;                  // 16 chars

export function decrypt(encrypted) {
  const encryptedBuffer = Buffer.from(encrypted, "base64");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    Buffer.from(IV)
  );

  let decrypted = decipher.update(encryptedBuffer, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}
