import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user has target level set
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
        <div className="w-16 h-16 bg-[#cc1f1f] rounded-[10px] mx-auto mb-4 flex items-center justify-center">
          <span className="text-white font-bold text-3xl">M</span>
        </div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}