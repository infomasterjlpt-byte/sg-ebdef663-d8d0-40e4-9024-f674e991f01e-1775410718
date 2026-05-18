import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#111111', padding: '40px 24px' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.svg"
            alt="Master JLPT"
            style={{ height: '36px', width: '36px', display: 'block' }}
          />
          <span style={{ fontSize: '18px', fontWeight: 800 }}>
            <span style={{ color: '#ffffff' }}>Master</span>
            <span style={{ color: '#cc1f1f' }}>JLPT</span>
          </span>
        </div>
        {/* Links */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#888888', fontSize: '14px', textDecoration: 'none' }}>Home</Link>
          <Link href="/pricing" style={{ color: '#888888', fontSize: '14px', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/auth/signup" style={{ color: '#888888', fontSize: '14px', textDecoration: 'none' }}>Sign Up</Link>
          <Link href="/privacy" style={{ color: '#888888', fontSize: '14px', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #222222', margin: '24px auto 16px', maxWidth: '1200px' }} />

      {/* Bottom — stacked on mobile */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
        <p style={{ color: '#555555', fontSize: '12px', margin: 0 }}>
          JLPT is a registered trademark of the Japan Foundation and JEES. This site is not affiliated with or endorsed by JEES.
        </p>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <p style={{ fontSize: '13px', margin: 0 }}>
            <span style={{ color: '#666666' }}>Powered by </span>
            <a href="https://tokienglish.com" target="_blank" rel="noopener noreferrer" style={{ color: '#cc1f1f', textDecoration: 'none' }}>Toki English</a>
          </p>
          <p style={{ color: '#666666', fontSize: '13px', margin: 0 }}>
            © {new Date().getFullYear()} Master JLPT
          </p>
        </div>
      </div>
    </footer>
  );
}
