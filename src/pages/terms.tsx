import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <>
      <SEO title="Terms of Service - JLPT Master" description="Terms of Service for JLPT Master by Toki English" />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-2xl">J</span>
              </div>
              <div>
                <div className="font-bold text-lg leading-none">JLPT Master</div>
                <div className="text-xs text-muted-foreground">by Toki English</div>
              </div>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </header>

        <div className="container max-w-4xl py-12">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using JLPT Master, you accept and agree to be bound by the terms and provisions 
                of this agreement. If you do not agree to these Terms of Service, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground">
                JLPT Master is a web-based Japanese language learning platform operated by Toki English. We provide 
                practice questions, mock exams, progress tracking, and study tools to help students prepare for the 
                Japanese Language Proficiency Test (JLPT).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-3">To use our service, you must:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Create an account with accurate information</li>
                <li>Be at least 13 years of age</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Subscription and Payment</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Free Plan</h3>
                  <p>Access to N5 level content with daily question limits.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Premium Plan ($5/month)</h3>
                  <p>Unlimited access to all JLPT levels (N5-N1), mock exams, and advanced features.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Subscriptions are billed monthly</li>
                    <li>Payment is processed through Stripe</li>
                    <li>Subscriptions automatically renew unless cancelled</li>
                    <li>Cancellations take effect at the end of the current billing period</li>
                    <li>No refunds for partial months</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. User Conduct</h2>
              <p className="text-muted-foreground mb-3">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Share your account credentials with others</li>
                <li>Copy, scrape, or redistribute our content</li>
                <li>Attempt to reverse-engineer our service</li>
                <li>Use automated tools to access our service</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate others or provide false information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, features, and functionality of JLPT Master, including but not limited to text, graphics, 
                logos, and software, are owned by Toki English and protected by international copyright, trademark, 
                and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Content Accuracy</h2>
              <p className="text-muted-foreground">
                While we strive to provide accurate and up-to-date JLPT preparation materials, we make no warranties 
                about the completeness, reliability, or accuracy of this information. Your use of the service is at 
                your own risk. We are not responsible for your exam results.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms 
                of Service. You may cancel your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Toki English shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages resulting from your use of or inability to use the service. Our total liability shall not 
                exceed the amount you paid for the service in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms of Service at any time. We will notify users of significant 
                changes via email or through the service. Continued use of the service after changes constitutes 
                acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms of Service shall be governed by and construed in accordance with the laws of the 
                jurisdiction in which Toki English operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">12. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-accent font-semibold mt-2">support@tokienglish.com</p>
            </section>

            <section className="border-t border-border pt-6 mt-8">
              <h2 className="text-2xl font-bold mb-4">JLPT Trademark Disclaimer</h2>
              <p className="text-muted-foreground text-sm">
                JLPT is a trademark of the Japan Foundation and Japan Educational Exchanges and Services. 
                JLPT Master is an independent study tool and is not affiliated with, endorsed by, or sponsored 
                by the Japan Foundation or Japan Educational Exchanges and Services. This service is designed 
                to help students prepare for the JLPT examination but does not guarantee exam results.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-8 mt-12">
          <div className="container text-center">
            <p className="text-sm">
              Powered by <span className="text-accent font-bold">Toki English</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              © {new Date().getFullYear()} Toki English. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}