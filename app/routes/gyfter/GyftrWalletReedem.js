import axios from "axios";
import { encrypt, decrypt } from "../helper/crypto";
import { validateRequest } from "../helper/validaterequest";

const GYFTR_URL =
  "https://brandpts.gyftr.net/api/merchant-services/walletRedemption";

export async function callGyftrWallet(headers, body) {
  const { userid, password } = headers;
  console.log("userid, password",userid, password)

  if (!userid || !password) {
    throw new Error("Userid/Password missing");
  }

  if (!body.TID) body.TID = `TID${Date.now()}`;
  if (!body.EREFNO) body.EREFNO = Date.now().toString();

  const { ok, missing } = validateRequest(body);
  if (!ok) {
    throw new Error(`Missing params: ${missing.join(", ")}`);
  }

  const amt = parseFloat(body.AMOUNT);
  if (isNaN(amt)) throw new Error("Invalid amount");
  body.AMOUNT = amt.toFixed(2);

  const payload = JSON.stringify({
    MOBILE: body.MOBILE,
    MID: body.MID,
    TID: body.TID,
    EREFNO: body.EREFNO,
    PORDERID: body.PORDERID,
    AMOUNT: body.AMOUNT,
    OTP: body.OTP,
    SOURCE: body.SOURCE,
    BILLNO: body.BILLNO,
    BILLVALUE: body.BILLVALUE
  });


  console.log("payload",payload)
  const encrypted = encrypt(
    payload,
    process.env.GYFTR_KEY,
    process.env.GYFTR_IV
  );

  const response = await axios.post(
    GYFTR_URL,
    { data: encrypted },
    {
      headers: {
        Userid: userid,
        Password: password,
        "Content-Type": "application/json"
      }
    }
  );

  console.log("==========",response)

  if (!response.data?.data) {
    throw new Error("Invalid GyFTR response");
  }

  const decrypted = decrypt(
    response.data.data,
    process.env.GYFTR_KEY,
    process.env.GYFTR_IV
  );

  console.log("decrypted", decrypted);

  return JSON.parse(decrypted);
}
