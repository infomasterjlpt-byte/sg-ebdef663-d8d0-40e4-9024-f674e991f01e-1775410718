import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from("users")
          .select("target_level")
          .eq("id", session.user.id)
          .single();

        if (profile?.target_level) {
          router.push("/dashboard");
        } else {
          router.push("/level-selection");
        }
      } else {
        router.push("/auth/login");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logo.svg"
              alt="Master JLPT"
              style={{ height: '28px', width: 'auto', display: 'block' }}
            />
            <span style={{ fontSize: '22px', fontWeight: 800, lineHeight: '28px' }}>
              <span style={{ color: '#111111' }}>Master</span>
              <span style={{ color: '#cc1f1f' }}>JLPT</span>
            </span>
          </div>
        </div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}