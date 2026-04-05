import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Crown } from "lucide-react";

const FEATURES = {
  free: [
    { text: "N5 Practice Questions", included: true },
    { text: "Daily 10-Question Quiz", included: true },
    { text: "Basic Progress Tracking", included: true },
    { text: "20 Questions Per Day Limit", included: true },
    { text: "N4-N1 Practice", included: false },
    { text: "Full Mock Exams", included: false },
    { text: "Unlimited Daily Questions", included: false },
    { text: "Advanced Analytics", included: false },
    { text: "Weak Point Analysis", included: false },
    { text: "Predicted Score", included: false },
  ],
  premium: [
    { text: "All N5-N1 Practice Questions", included: true },
    { text: "Daily Quiz (Any Level)", included: true },
    { text: "Advanced Progress Tracking", included: true },
    { text: "Unlimited Daily Questions", included: true },
    { text: "Full Mock Exams (All Levels)", included: true },
    { text: "Timed Practice Sessions", included: true },
    { text: "Weak Kanji/Vocab Lists", included: true },
    { text: "Study Time Graphs", included: true },
    { text: "Predicted JLPT Score", included: true },
    { text: "Priority Support", included: true },
  ]
};

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUser(user);

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
  }

  async function handleUpgrade() {
    setLoading(true);
    
    // TODO: Implement Stripe Checkout
    // For now, show alert with instructions
    alert("Stripe integration coming soon! Contact support@tokienglish.com to upgrade manually.");
    
    setLoading(false);
  }

  return (
    <>
      <SEO title="Pricing - JLPT Master" description="Choose your JLPT Master plan" />
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Unlock your full JLPT potential with Premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div>
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Perfect for N5 beginners
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FEATURES.free.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground/50"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!userProfile?.is_premium}
                >
                  {userProfile?.is_premium ? "Current Plan" : "Free Forever"}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-accent relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-sm font-semibold">
                RECOMMENDED
              </div>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-accent" />
                    <CardTitle className="text-2xl">Premium</CardTitle>
                  </div>
                  <div>
                    <span className="text-4xl font-bold">$5</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete JLPT mastery toolkit
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FEATURES.premium.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={handleUpgrade}
                  disabled={loading || userProfile?.is_premium}
                  className="w-full"
                >
                  {loading ? "Processing..." : userProfile?.is_premium ? "Current Plan" : "Upgrade to Premium"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Why Premium?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">5 Levels</div>
                  <p className="text-sm text-muted-foreground">Complete N5-N1 question bank</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">Unlimited</div>
                  <p className="text-sm text-muted-foreground">No daily question limits</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">Full Tests</div>
                  <p className="text-sm text-muted-foreground">Authentic timed mock exams</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}