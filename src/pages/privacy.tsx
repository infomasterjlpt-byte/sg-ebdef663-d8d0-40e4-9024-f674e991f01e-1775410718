import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  return (
    <>
      <SEO title="Privacy Policy - Master JLPT" description="Privacy policy for Master JLPT by Toki English" />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-[#cc1f1f] rounded-[10px] flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div className="flex items-center gap-1" style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>
                <span className="font-extrabold text-[#111111]">Master</span>
                <span className="font-normal text-[#cc1f1f]">JLPT</span>
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
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                Toki English ("we," "our," or "us") operates Master JLPT. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Account information (email address, name)</li>
                <li>Study preferences and target JLPT level</li>
                <li>Practice session data and quiz results</li>
                <li>Progress tracking information</li>
                <li>Payment information (processed securely through Stripe)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Track your learning progress and study patterns</li>
                <li>Personalize your learning experience</li>
                <li>Process your subscription payments</li>
                <li>Send you service-related communications</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                Your data is stored securely using Supabase, a PostgreSQL database service. We implement appropriate 
                technical and organizational measures to protect your personal information against unauthorized access, 
                alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Third-Party Services</h2>
              <p className="text-muted-foreground mb-3">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Supabase:</strong> Database and authentication services</li>
                <li><strong>Google OAuth:</strong> Optional sign-in method</li>
                <li><strong>Stripe:</strong> Payment processing (premium subscriptions)</li>
                <li><strong>Vercel:</strong> Hosting and deployment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="text-muted-foreground mb-3">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not directed to children under 13. We do not knowingly collect personal information 
                from children under 13. If you are a parent or guardian and believe your child has provided us with 
                personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-[#cc1f1f] font-semibold mt-2">privacy@tokienglish.com</p>
            </section>

            <section className="border-t border-border pt-6 mt-8">
              <h2 className="text-2xl font-bold mb-4">JLPT Trademark Notice</h2>
              <p className="text-muted-foreground text-sm">
                JLPT is a trademark of the Japan Foundation and Japan Educational Exchanges and Services. 
                Master JLPT is not affiliated with or endorsed by the Japan Foundation or Japan Educational 
                Exchanges and Services. We are an independent study tool designed to help students prepare 
                for the JLPT examination.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-8 mt-12">
          <div className="container text-center space-y-2">
            <p className="text-sm">
              Powered by <span className="text-[#cc1f1f] font-bold">Toki English</span>
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Toki English. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              JLPT is a trademark of the Japan Foundation and Japan Educational Exchanges and Services. 
              This app is not affiliated with or endorsed by the Japan Foundation.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}