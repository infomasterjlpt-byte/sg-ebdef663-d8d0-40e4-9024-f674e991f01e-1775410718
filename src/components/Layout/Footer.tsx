import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white w-full">
      <div className="px-6 sm:px-20 py-10 sm:py-[60px] pb-10 sm:pb-10">
        {/* Top Row - Logo and Tagline */}
        <div className="mb-12">
          <Link href="/" className="inline-block mb-2">
            <span className="text-2xl font-bold text-white">Master JLPT</span>
          </Link>
          <p className="text-[#888888] text-[13px]">
            Your path to JLPT mastery.
          </p>
        </div>

        {/* Middle Section - Four Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-12 mt-12">
          {/* Column 1 - Levels */}
          <div>
            <h3 className="text-white font-bold text-[14px] mb-4 tracking-[0.05em] uppercase">
              Levels
            </h3>
            <div className="space-y-2.5">
              <Link 
                href="/levels/n5" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                N5 Beginner
              </Link>
              <Link 
                href="/levels/n4" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                N4 Elementary
              </Link>
              <Link 
                href="/levels/n3" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                N3 Intermediate
              </Link>
              <Link 
                href="/levels/n2" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                N2 Upper Intermediate
              </Link>
              <Link 
                href="/levels/n1" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                N1 Advanced
              </Link>
            </div>
          </div>

          {/* Column 2 - Company */}
          <div>
            <h3 className="text-white font-bold text-[14px] mb-4 tracking-[0.05em] uppercase">
              Company
            </h3>
            <div className="space-y-2.5">
              <Link 
                href="#" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                About
              </Link>
              <Link 
                href="#" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Blog
              </Link>
              <Link 
                href="#" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Contact
              </Link>
              <Link 
                href="/privacy" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Column 3 - Resources */}
          <div>
            <h3 className="text-white font-bold text-[14px] mb-4 tracking-[0.05em] uppercase">
              Resources
            </h3>
            <div className="space-y-2.5">
              <Link 
                href="/grammar-guide" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Grammar Guide
              </Link>
              <Link 
                href="/exam-tips" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Exam Tips
              </Link>
              <Link 
                href="/practice" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Practice
              </Link>
              <Link 
                href="/mock-test" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Mock Tests
              </Link>
            </div>
          </div>

          {/* Column 4 - Support */}
          <div>
            <h3 className="text-white font-bold text-[14px] mb-4 tracking-[0.05em] uppercase">
              Support
            </h3>
            <div className="space-y-2.5">
              <Link 
                href="#" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Help Center
              </Link>
              <Link 
                href="#" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                FAQ
              </Link>
              <Link 
                href="/pricing" 
                className="block text-[#888888] text-[14px] hover:text-white transition-colors no-underline"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#222222] mt-12 mb-6"></div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          {/* Left - Powered by */}
          <div className="text-[13px]">
            <span className="text-[#666666]">Powered by </span>
            <span className="text-[#cc1f1f] font-medium">Toki English</span>
          </div>

          {/* Right - Copyright */}
          <p className="text-[#555555] text-[12px] max-w-2xl">
            © 2026 Master JLPT. JLPT is a registered trademark of JEES. This site is not affiliated with or endorsed by JEES.
          </p>
        </div>
      </div>
    </footer>
  );
}