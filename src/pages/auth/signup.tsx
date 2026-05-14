import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * /auth/signup — Google-only auth means sign-up and sign-in are the same flow.
 * Redirect to /auth/login, preserving any ?plan= query param.
 */
export default function Signup() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { plan } = router.query;
    router.replace(`/auth/login${plan ? `?plan=${plan}` : ""}`);
  }, [router.isReady]);

  return null;
}
