import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { plan } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If already logged in, redirect to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard');
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    const redirectTo = `${window.location.origin}/auth/callback${plan ? `?plan=${plan}` : ''}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-md p-10 w-full max-w-sm flex flex-col items-center gap-6">
        {/* Logo */}
        <Image src="/logo.svg" alt="Master JLPT" width={64} height={64} />
        <h1 className="text-2xl font-bold text-[#111111]">Sign in to Master JLPT</h1>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2 w-full text-center">
            {error}
          </p>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.09-6.09C34.46 3.05 29.5 1 24 1 14.82 1 7.07 6.64 3.96 14.63l7.1 5.52C12.72 14.06 17.94 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v8.98h12.7c-.55 2.94-2.2 5.43-4.68 7.1l7.18 5.58C43.46 37.3 46.52 31.36 46.52 24.5z"/>
            <path fill="#FBBC05" d="M11.06 28.85A14.55 14.55 0 0 1 9.5 24c0-1.69.29-3.32.8-4.85l-7.1-5.52A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.75l8.5-5.9z"/>
            <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.5-4.94l-7.18-5.58c-1.82 1.22-4.15 1.95-6.32 1.95-6.06 0-11.28-4.56-12.94-10.65l-8.5 5.9C7.07 41.36 14.82 47 24 47z"/>
          </svg>
          {loading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          By signing in you agree to our{' '}
          <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
