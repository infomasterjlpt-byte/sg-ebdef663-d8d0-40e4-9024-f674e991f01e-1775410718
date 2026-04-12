import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 mt-auto">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <img 
              src="/logo.svg" 
              alt="Master JLPT" 
              style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
            <p className="text-sm text-muted-foreground">
              Master the JLPT with structured practice and progress tracking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/levels" className="hover:text-foreground">Levels</Link></li>
              <li><Link href="/practice" className="hover:text-foreground">Practice</Link></li>
              <li><Link href="/mock-test" className="hover:text-foreground">Mock Tests</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/grammar-guide" className="hover:text-foreground">Grammar Guide</Link></li>
              <li><Link href="/exam-tips" className="hover:text-foreground">Exam Tips</Link></li>
              <li><Link href="/progress" className="hover:text-foreground">Track Progress</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Master JLPT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}