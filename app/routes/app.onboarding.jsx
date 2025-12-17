export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const host = url.searchParams.get("host");

  const thirdPartyUrl =
    `http://127.0.0.1:5500/index.html?host=${host}&shop=${session.shop}`;

  return { thirdPartyUrl };
};


export default function Onboarding() {
  const { thirdPartyUrl } = useLoaderData();
  const redirected = useRef(false);

  useEffect(() => {
    if (!redirected.current) {
      redirected.current = true;
      window.location.href = thirdPartyUrl; // SAME TAB
    }
  }, []);

  return <p>Redirecting for onboarding…</p>;
}
