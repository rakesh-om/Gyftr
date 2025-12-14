export async function loader({ request }) {
  const response = await fetch("http://localhost:8091/api/payment/getEpayBalance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mobile: "8269990916"
    })
  });

  return response;
}
