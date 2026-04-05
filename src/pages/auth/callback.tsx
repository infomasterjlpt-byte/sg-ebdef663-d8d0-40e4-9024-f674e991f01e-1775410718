import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        supabase
          .from("users")
          .select("target_level")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.target_level) {
              router.push("/");
            } else {
              router.push("/level-selection");
            }
          });
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded mx-auto mb-4 flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-3xl">J</span>
        </div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}