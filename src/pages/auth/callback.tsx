import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Check if plan param exists in URL (for payment redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const plan = urlParams.get("plan");

        // Create profile if it doesn't exist
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, level")
          .eq("id", session.user.id)
          .single();

        if (!profile) {
          await supabase.from("profiles").insert({
            id: session.user.id,
            email: session.user.email,
            level: "N5",
            is_premium: false,
            created_at: new Date().toISOString(),
          });
        }

        // Redirect based on plan param
        if (plan === "monthly") {
          window.location.href = "https://buy.stripe.com/14A8wO68q89g1s48rC5os00";
        } else if (plan === "sixmonth") {
          window.location.href = "https://buy.stripe.com/aFa00i7cuaho2w86ju5os01";
        } else {
          router.push("/dashboard");
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
