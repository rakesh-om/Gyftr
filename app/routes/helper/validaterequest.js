function validateRequest(body) {
  const required = ['MOBILE', 'MID', 'PORDERID', 'AMOUNT', 'OTP', 'SOURCE', 'BILLNO', 'BILLVALUE'];
  const missing = required.filter(k => !body[k] || String(body[k]).trim() === '');
  return { ok: missing.length === 0, missing };
}
 
export { validateRequest };