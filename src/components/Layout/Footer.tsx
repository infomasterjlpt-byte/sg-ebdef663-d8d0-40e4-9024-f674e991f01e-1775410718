import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#111111', padding: '40px 80px' }}>
      
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/logo.svg"
            alt="Master JLPT"
            style={{ height: '28px', width: 'auto', filter: 'brightness(0) invert(1)' }}
          />
          <span style={{ fontSize: '18px', fontWeight: 800 }}>
            <span style={{ color: '#ffffff' }}>Master</span>
            <span style={{ color: '#cc1f1f' }}>JLPT</span>
          </span>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '32px' }}>
          <Link href="/" style={{ color: '#888888', fontSize: '14px', textDecoration: 'none' }}>Home</Link>
          <Link href="/pricing" style={{ color: '#888888', fontSize: '14px', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/auth/signup" style={{ color: '#888888', fontSize: '14px', textDecoration: 'none' }}>Sign Up</Link>
        </div>

      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #222222', margin: '24px 0 16px' }} />

   {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '13px', margin: 0 }}>
          <span style={{ color: '#666666' }}>Powered by </span>
          <a href="https://tokienglish.com" target="_blank" rel="noopener noreferrer" style={{ color: '#cc1f1f', textDecoration: 'none' }}>Toki English</a>
        </p>
        <p style={{ color: '#555555', fontSize: '12px', margin: 0, textAlign: 'center', flex: 1, padding: '0 24px' }}>
          JLPT is a registered trademark of the Japan Foundation and JEES. This site is not affiliated with or endorsed by JEES.
        </p>
        <p style={{ color: '#666666', fontSize: '13px', margin: 0 }}>
          © {new Date().getFullYear()} Master JLPT
        </p>
      </div>

    </footer>
  );
}
