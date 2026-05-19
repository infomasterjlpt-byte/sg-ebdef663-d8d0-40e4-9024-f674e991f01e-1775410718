import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Check, X } from "lucide-react";

const FREE_FEATURES = [
  { text: "N5 Practice Questions", included: true },
  { text: "Kanji, Grammar & Reading", included: true },
  { text: "Track your progress", included: true },
  { text: "Group by topic practice", included: true },
  { text: "All levels N5 to N2", included: false },
  { text: "Unlimited questions", included: false },
  { text: "Full mock tests", included: false },
  { text: "Review system", included: false },
];

const PAID_FEATURES = [
  { text: "Everything in Free" },
  { text: "All levels N5 to N2" },
  { text: "Unlimited practice questions" },
  { text: "Full mock tests" },
  { text: "Review system" },
  { text: "Priority support" },
  { text: "Cancel anytime" },
];

export default function Pricing() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const { convertPrice, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserProfile(profile);
  }

  const symbol = getCurrencySymbol();

  return (
    <>
      <SEO title="Pricing - Master JLPT" description="Choose your Master JLPT plan" />
      <AppLayout>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111111', margin: '0 0 8px' }}>Choose Your Plan</h1>
            <p style={{ fontSize: '15px', color: '#888888', margin: 0 }}>Start free. Upgrade when you are ready.</p>
          </div>

          {/* Cards — responsive grid */}
          <div className="pricing-grid">

            {/* Free */}
            <div style={{ background: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#888888', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Free</p>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#111111', fontSize: '40px', fontWeight: 800 }}>{symbol}0</span>
                  <span style={{ color: '#888888', fontSize: '14px' }}>/month</span>
                </div>
                <p style={{ color: '#888888', fontSize: '13px', margin: '0 0 20px' }}>Start learning for free</p>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginBottom: '20px' }}>
                  {FREE_FEATURES.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      {f.included ? <Check size={15} color="#22c55e" /> : <X size={15} color="#cccccc" />}
                      <span style={{ color: f.included ? '#444444' : '#cccccc', fontSize: '13px' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/auth/signup" style={{ width: '100%' }}>
                <button style={{ width: '100%', padding: '13px', background: 'transparent', border: '1.5px solid #cccccc', borderRadius: '8px', color: '#111111', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Get Started
                </button>
              </Link>
            </div>

            {/* Monthly */}
            <div style={{ background: '#ffffff', border: '2px solid #cc1f1f', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(204,31,31,0.12)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#cc1f1f', color: '#ffffff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '5px 16px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                MOST POPULAR
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#cc1f1f', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Monthly</p>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#111111', fontSize: '40px', fontWeight: 800 }}>{symbol}{convertPrice(499)}</span>
                  <span style={{ color: '#888888', fontSize: '14px' }}>/month</span>
                </div>
                <p style={{ color: '#888888', fontSize: '13px', margin: '0 0 20px' }}>Billed monthly · cancel anytime</p>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginBottom: '20px' }}>
                  {PAID_FEATURES.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <Check size={15} color="#cc1f1f" />
                      <span style={{ color: '#111111', fontSize: '13px' }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <a href="https://buy.stripe.com/14A8wO68q89g1s48rC5os00" style={{ width: '100%', textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '13px', background: '#cc1f1f', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  {userProfile?.is_premium ? 'Current Plan' : 'Get Monthly Access'}
                </button>
              </a>
            </div>

            {/* 6 Months */}
            <div style={{ background: '#ffffff', border: '2px solid #f59e0b', borderRadius: '16px', padding: '28px 24px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(245,158,11,0.1)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#111111', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '5px 16px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                BEST VALUE
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>6 Months</p>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#111111', fontSize: '40px', fontWeight: 800 }}>{symbol}{convertPrice(2499)}</span>
                  <span style={{ color: '#888888', fontSize: '14px' }}>/6 months</span>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ background: '#fff8e6', color: '#d97706', fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>Save {symbol}{convertPrice(495)} vs monthly</span>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginBottom: '20px' }}>
                  {PAID_FEATURES.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <Check size={15} color="#f59e0b" />
                      <span style={{ color: '#111111', fontSize: '13px' }}>{f.text}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Check size={15} color="#f59e0b" />
                    <span style={{ color: '#111111', fontSize: '13px' }}>6 months at lower price</span>
                  </div>
                </div>
              </div>
              <a href="https://buy.stripe.com/aFa00i7cuaho2w86ju5os01" style={{ width: '100%', textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '13px', background: '#f59e0b', border: 'none', borderRadius: '8px', color: '#111111', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
                  {userProfile?.is_premium ? 'Current Plan' : 'Get 6 Months Access'}
                </button>
              </a>
            </div>

          </div>

          <p style={{ textAlign: 'center', color: '#aaaaaa', fontSize: '13px', marginTop: '32px' }}>
            Secure payment via Stripe · Cancel anytime · No hidden fees
          </p>

        </div>

        <style>{`
          .pricing-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
          }
          @media (min-width: 768px) {
            .pricing-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }
        `}</style>
      </AppLayout>
    </>
  );
}
