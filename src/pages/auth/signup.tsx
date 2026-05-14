import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * /auth/signup — With Google-only auth, sign-up and sign-in are the same flow.
 * Just redirect to /auth/login, preserving any ?plan= query param.
 */
export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { plan } = router.query;
    router.replace(`/auth/login${plan ? `?plan=${plan}` : ''}`);
  }, [router]);

  return null;
}
