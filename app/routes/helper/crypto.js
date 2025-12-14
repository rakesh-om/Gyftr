import CryptoJS from "crypto-js";

// Encrypt raw JSON string using AES-256-CBC
export function encrypt(text, key, iv) {
  const KEY = CryptoJS.enc.Utf8.parse(key);
  const IV = CryptoJS.enc.Utf8.parse(iv);

  const encrypted = CryptoJS.AES.encrypt(text, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString(); // base64
}

// Decrypt base64 string using AES-256-CBC
export function decrypt(encryptedText, key, iv) {
  const KEY = CryptoJS.enc.Utf8.parse(key);
  const IV = CryptoJS.enc.Utf8.parse(iv);

  const decrypted = CryptoJS.AES.decrypt(encryptedText, KEY, {
    iv: IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
