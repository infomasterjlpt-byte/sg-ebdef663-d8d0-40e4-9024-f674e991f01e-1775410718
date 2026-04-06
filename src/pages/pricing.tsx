import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Check, X, Crown, Zap } from "lucide-react";

const FEATURES = {
  free: [
    { text: "3 Questions Per Day", included: true },
    { text: "Basic Progress Tracking", included: true },
    { text: "Daily Streak Counter", included: true },
    { text: "N5 Level Only (Limited)", included: true },
    { text: "Full N5-N1 Practice", included: false },
    { text: "Mock Exams", included: false },
    { text: "Unlimited Daily Questions", included: false },
    { text: "Advanced Analytics", included: false },
    { text: "Weak Point Analysis", included: false },
    { text: "Predicted Score", included: false },
  ],
  premium: [
    { text: "All N5-N1 Practice Questions", included: true },
    { text: "Unlimited Daily Questions", included: true },
    { text: "Basic Progress Tracking", included: true },
    { text: "Daily Quiz (Any Level)", included: true },
    { text: "Full Mock Exams (All Levels)", included: true },
    { text: "Timed Practice Sessions", included: true },
    { text: "Advanced Analytics", included: true },
    { text: "Study Time Graphs", included: true },
    { text: "Priority Support", included: true },
  ],
  premiumPlus: [
    { text: "Everything in Premium", included: true },
    { text: "6 Months Access", included: true },
    { text: "Weak Kanji/Vocab Lists", included: true },
    { text: "Predicted JLPT Score", included: true },
    { text: "Personalized Study Plan", included: true },
    { text: "Exclusive Study Materials", included: true },
    { text: "Priority Email Support", included: true },
    { text: "Early Access to New Features", included: true },
    { text: "Certificate of Completion", included: true },
    { text: "Best Value - Save 17%", included: true },
  ]
};

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { currency, convertPrice, getCurrencySymbol } = useCurrency();

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

  async function handleUpgrade(plan: "monthly" | "sixmonth") {
    setLoading(true);
    
    // TODO: Implement Stripe Checkout
    alert(`Stripe integration coming soon! Contact support@tokienglish.com to upgrade to ${plan === "monthly" ? "Premium Monthly" : "Premium Plus (6 months)"}.`);
    
    setLoading(false);
  }

  const monthlyPrice = 499;
  const sixMonthPrice = 2499;
  const symbol = getCurrencySymbol();

  return (
    <>
      <SEO title="Pricing - Master JLPT" description="Choose your Master JLPT plan" />
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Unlock your full JLPT potential with Premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div>
                    <span className="text-4xl font-bold">{symbol}0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Try before you commit
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
                  asChild
                >
                  <Link href="/auth/signup">
                    {userProfile?.is_premium ? "Current Plan" : "Get Started"}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Monthly */}
            <Card className="border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-semibold">
                POPULAR
              </div>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl">Premium</CardTitle>
                  </div>
                  <div>
                    <span className="text-4xl font-bold">{symbol}{convertPrice(monthlyPrice)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Full access, unlimited practice
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FEATURES.premium.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade("monthly")}
                  disabled={loading || userProfile?.is_premium}
                  className="w-full"
                >
                  {loading ? "Processing..." : userProfile?.is_premium ? "Current Plan" : "Upgrade to Premium"}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plus 6 Months */}
            <Card className="border-2 border-accent relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-sm font-semibold flex items-center gap-1">
                <Zap className="h-4 w-4" />
                BEST VALUE
              </div>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-accent" />
                    <CardTitle className="text-2xl">Premium Plus</CardTitle>
                  </div>
                  <div>
                    <span className="text-4xl font-bold">{symbol}{convertPrice(sixMonthPrice)}</span>
                    <span className="text-muted-foreground">/6 months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-accent text-accent">
                      Save {symbol}{convertPrice(monthlyPrice * 6 - sixMonthPrice)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maximum value for serious learners
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {FEATURES.premiumPlus.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium">{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade("sixmonth")}
                  disabled={loading || userProfile?.is_premium}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {loading ? "Processing..." : userProfile?.is_premium ? "Current Plan" : "Get Premium Plus"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Why Choose Premium?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">5 Levels</div>
                  <p className="text-sm text-muted-foreground">Complete N5-N1 question bank</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">Unlimited</div>
                  <p className="text-sm text-muted-foreground">No daily question limits</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">Full Tests</div>
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