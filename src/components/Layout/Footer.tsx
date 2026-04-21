import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-800 py-8 mt-auto" style={{ paddingLeft: '5%', paddingRight: '5%', backgroundColor: '#000000' }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/logo.svg"
                alt="Master JLPT"
                style={{
                  height: '40px',
                  width: '40px',
                  display: 'block',
                  minHeight: '40px',
                  maxHeight: '40px',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1', letterSpacing: '-0.5px' }}>
                <span style={{ color: '#ffffff' }}>Master</span>
                <span style={{ color: '#ffffff' }}>JLPT</span>
              </span>
            </div>
            <p className="text-sm" style={{ color: '#a3a3a3' }}>
              Master the JLPT with structured practice and progress tracking.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/levels" className="hover:text-white" style={{ color: '#a3a3a3' }}>Levels</Link></li>
              <li><Link href="/practice" className="hover:text-white" style={{ color: '#a3a3a3' }}>Practice</Link></li>
              <li><Link href="/mock-test" className="hover:text-white" style={{ color: '#a3a3a3' }}>Mock Tests</Link></li>
              <li><Link href="/pricing" className="hover:text-white" style={{ color: '#a3a3a3' }}>Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/grammar-guide" className="hover:text-white" style={{ color: '#a3a3a3' }}>Grammar Guide</Link></li>
              <li><Link href="/exam-tips" className="hover:text-white" style={{ color: '#a3a3a3' }}>Exam Tips</Link></li>
              <li><Link href="/progress" className="hover:text-white" style={{ color: '#a3a3a3' }}>Track Progress</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3" style={{ color: '#ffffff' }}>Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-white" style={{ color: '#a3a3a3' }}>Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white" style={{ color: '#a3a3a3' }}>Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm" style={{ color: '#737373' }}>
          <p>&copy; {new Date().getFullYear()} Master JLPT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}