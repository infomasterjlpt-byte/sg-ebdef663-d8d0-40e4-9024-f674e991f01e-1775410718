import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { BookOpen, Target, Award, Check, Star, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { Footer } from "@/components/Layout/Footer";
import { authService } from "@/services/authService";

export default function Home() {
  const [currency, setCurrency] = useState<"JPY" | "USD" | "BDT" | "NPR" | "INR" | "VND" | "LKR">("JPY");
  const [currentSlide, setCurrentSlide] = useState(0);

  const reviews = [
    { name: "Tanvir M.", flag: "🇧🇩", stars: 5, level: "N5", text: "I passed N5 on my first attempt after just 3 months of using Master JLPT. The kanji drills are incredibly effective and the explanations are clear." },
    { name: "Nguyen T.", flag: "🇻🇳", stars: 5, level: "N4", text: "The reading passages feel exactly like the real exam. I improved my score from 60% to 88% in two months of daily practice." },
    { name: "Priya S.", flag: "🇮🇳", stars: 5, level: "N3", text: "Best JLPT prep resource I have found. The grammar explanations are clear and the mock tests are very realistic. Highly recommend." },
    { name: "Carlos R.", flag: "🇵🇭", stars: 4, level: "N2", text: "Great question bank and easy to track progress. The topic by topic practice helped me focus on my weak areas." },
    { name: "Li W.", flag: "🇨🇳", stars: 5, level: "N4", text: "I study on my phone during my commute every day. The interface is clean and the questions are high quality. Worth every minute." },
    { name: "Amara K.", flag: "🇧🇩", stars: 5, level: "N4", text: "Failed N4 twice before finding this site. The topic by topic practice helped me identify my weak areas. Passed with 82% on my third attempt." }
  ];

  const levelColors: Record<string, { bg: string; text: string }> = {
    N5: { bg: "bg-green-100", text: "text-green-700" },
    N4: { bg: "bg-teal-100", text: "text-teal-700" },
    N3: { bg: "bg-purple-100", text: "text-purple-700" },
    N2: { bg: "bg-amber-100", text: "text-amber-700" },
    N1: { bg: "bg-red-900", text: "text-white" }
  };

  const totalSlides = Math.ceil(reviews.length / 3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const getCurrencySymbol = (curr: string) => {
    switch(curr) {
      case "USD": return "$";
      case "BDT": return "৳";
      case "NPR": return "₨";
      case "INR": return "₹";
      case "VND": return "₫";
      case "LKR": return "රු";
      case "JPY": default: return "¥";
    }
  };

  const convertPrice = (jpyAmount: number, curr: string): string => {
    const rates: Record<string, number> = {
      JPY: 1,
      USD: 0.0067,
      BDT: 0.735,
      NPR: 0.894,
      INR: 0.557,
      VND: 168,
      LKR: 2.0,
    };
    const converted = Math.round(jpyAmount * (rates[curr] || 1));
    if (curr === "VND" || curr === "JPY") return converted.toLocaleString();
    return converted.toString();
  };

  const symbol = getCurrencySymbol(currency);

  return (
    <>
      <SEO
        title="Master JLPT — Japanese Language Study"
        description="Master the JLPT with practice for N5 to N1. Track your progress, fix your weak points, and pass your exam."
      />

      {/* Header */}
      <header style={{
        width: '100%',
        backgroundColor: 'white',
        borderBottom: '2px solid #cc1f1f',
        padding: '0 24px',
        minHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.svg" alt="Master JLPT" width={44} height={44} style={{ height: '44px', width: '44px', display: 'block', flexShrink: 0 }} />
          <span style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1 }}>
            <span style={{ color: '#111111' }}>Master</span>
            <span style={{ color: '#cc1f1f' }}>JLPT</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Select value={currency} onValueChange={(val) => setCurrency(val as "JPY" | "USD" | "BDT" | "NPR" | "INR" | "VND" | "LKR")}>
            <SelectTrigger className="w-[100px] h-9">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="JPY">¥ JPY</SelectItem>
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="BDT">৳ BDT</SelectItem>
              <SelectItem value="NPR">₨ NPR</SelectItem>
              <SelectItem value="INR">₹ INR</SelectItem>
              <SelectItem value="VND">₫ VND</SelectItem>
              <SelectItem value="LKR">රු LKR</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-2 border-gray-300" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button className="bg-[#cc1f1f] hover:bg-[#b01b1b] text-white" asChild>
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-[#cc1f1f]" />
        <div className="absolute pointer-events-none select-none" style={{ right: '-20px', top: '50%', transform: 'translateY(-50%)', zIndex: 0 }}>
          <span className="leading-none" style={{ fontSize: '220px', fontWeight: 900, color: '#d4d4d4', opacity: 0.5 }}>日本語</span>
        </div>
        <div className="container relative py-20 md:py-32" style={{ zIndex: 1, position: 'relative' }}>
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-[#111111]">Master the JLPT.</span>
              <span className="block">
                <span className="text-[#cc1f1f]">One level</span>
                <span className="text-[#111111]"> at a time.</span>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Structured kanji, grammar, and reading practice for every JLPT level. Study smarter, track your progress, pass your exam.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button size="lg" className="bg-[#cc1f1f] hover:bg-[#b01b1b] text-white px-8" asChild>
                <Link href="/auth/signup">Start Learning Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-[#cc1f1f] hover:text-[#cc1f1f]" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-4 w-4 text-[#cc1f1f]" /><span>N5 to N2</span></div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-4 w-4 text-[#cc1f1f]" /><span>Track Progress</span></div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-4 w-4 text-[#cc1f1f]" /><span>Mock Tests</span></div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-2 text-sm text-gray-600"><Check className="h-4 w-4 text-[#cc1f1f]" /><span>3 Free Questions Daily</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-[#f8f8f8]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#111111] mb-4">Everything you need to pass the JLPT</h2>
            <p className="text-gray-600 text-lg">Comprehensive tools and resources for every level</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex justify-center mb-4"><div className="p-4 rounded-full bg-red-50"><BookOpen className="h-8 w-8 text-[#cc1f1f]" /></div></div>
                <h3 className="font-bold text-xl text-[#111111]">Practice Questions</h3>
                <p className="text-gray-600">Thousands of questions across kanji, grammar, and reading comprehension</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex justify-center mb-4"><div className="p-4 rounded-full bg-red-50"><Target className="h-8 w-8 text-[#cc1f1f]" /></div></div>
                <h3 className="font-bold text-xl text-[#111111]">Progress Tracking</h3>
                <p className="text-gray-600">Monitor your daily progress and category performance</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex justify-center mb-4"><div className="p-4 rounded-full bg-red-50"><Award className="h-8 w-8 text-[#cc1f1f]" /></div></div>
                <h3 className="font-bold text-xl text-[#111111]">Mock Tests</h3>
                <p className="text-gray-600">Full-length practice exams with realistic timing and difficulty</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-12 bg-[#f8f8f8]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#111111] mb-4">Choose your level</h2>
            <p className="text-gray-600 text-lg">Click any level to see the full syllabus and available practice questions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {[
              { level: "N5", label: "Beginner", desc: "Perfect starting point", color: "#22c55e", href: "/levels/n5" },
              { level: "N4", label: "Elementary", desc: "Build on basics", color: "#14b8a6", href: "/levels/n4" },
              { level: "N3", label: "Intermediate", desc: "Bridge level", color: "#8b5cf6", href: "/levels/n3" },
              { level: "N2", label: "Upper Intermediate", desc: "Near fluency", color: "#f59e0b", href: "/levels/n2" },
              { level: "N1", label: "Advanced", desc: "Near native", color: "#991b1b", href: "/levels/n1" },
            ].map(({ level, label, desc, color, href }) => (
              <Link key={level} href={href} className="group">
                <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full" style={{ borderTop: `4px solid ${color}` }}>
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="text-4xl font-bold" style={{ color }}>{level}</div>
                    <h3 className="font-bold text-xl text-[#111111]">{label}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                    <div className="pt-2"><span className="text-[#cc1f1f] text-sm font-medium">View Syllabus →</span></div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-600 text-lg">Your path to JLPT success in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { n: 1, title: "Choose Your Level", desc: "Select your target JLPT level from N5 to N2" },
              { n: 2, title: "Practice Daily", desc: "Answer questions and build your knowledge" },
              { n: 3, title: "Track Progress", desc: "Monitor your improvement with detailed stats" },
              { n: 4, title: "Pass Your Exam", desc: "Take the JLPT with confidence" },
            ].map(({ n, title, desc }) => (
              <div key={n} className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#cc1f1f] flex items-center justify-center text-white text-2xl font-bold">{n}</div>
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">What our learners say</h2>
            <p className="text-lg text-gray-600">Join thousands of JLPT learners worldwide</p>
          </div>
          <div className="relative max-w-7xl mx-auto">
            <button onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors hidden md:block">
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors hidden md:block">
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="min-w-full flex gap-6 px-2">
                    <div className="hidden md:grid md:grid-cols-3 gap-6 w-full">
                      {reviews.slice(slideIndex * 3, slideIndex * 3 + 3).map((review, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7">
                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-5 w-5 ${i < review.stars ? "fill-[#cc1f1f] text-[#cc1f1f]" : "fill-gray-300 text-gray-300"}`} />
                            ))}
                          </div>
                          <p className="text-[#555555] text-[15px] leading-[1.6] italic mb-6">&ldquo;{review.text}&rdquo;</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{review.flag}</span>
                            <span className="font-bold text-gray-900">{review.name}</span>
                            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${levelColors[review.level].bg} ${levelColors[review.level].text}`}>{review.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="md:hidden w-full">
                      {reviews.slice(slideIndex * 3, slideIndex * 3 + 1).map((review, idx) => (
                        <div key={idx} className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7">
                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-5 w-5 ${i < review.stars ? "fill-[#cc1f1f] text-[#cc1f1f]" : "fill-gray-300 text-gray-300"}`} />
                            ))}
                          </div>
                          <p className="text-[#555555] text-[15px] leading-[1.6] italic mb-6">&ldquo;{review.text}&rdquo;</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{review.flag}</span>
                            <span className="font-bold text-gray-900">{review.name}</span>
                            <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${levelColors[review.level].bg} ${levelColors[review.level].text}`}>{review.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 w-2 rounded-full transition-all duration-300 ${currentSlide === index ? "bg-[#cc1f1f] w-8" : "bg-gray-300"}`} />
              ))}
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-[#888888] text-[13px]">★★★★★ Average 4.9 out of 5 from our learners</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 bg-[#f8f8f8]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Simple, honest pricing</h2>
            <p className="text-lg text-gray-600">Start free. Upgrade when you are ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

            {/* Free */}
            <div className="bg-white rounded-2xl border border-[#e5e5e5] p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="mb-6">
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">FREE</p>
                <div className="mb-2"><span className="text-5xl font-bold text-black">{symbol}0</span><span className="text-gray-600 text-lg">/month</span></div>
                <p className="text-gray-600 text-sm">Start learning for free · 3 questions per day</p>
              </div>
              <div className="flex-grow mb-6 space-y-3">
                {["N5 Practice Questions", "Kanji Grammar & Reading", "Track your progress", "Group by topic practice"].map(f => (
                  <div key={f} className="flex items-start gap-3"><Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" /><span className="text-gray-700 text-sm">{f}</span></div>
                ))}
                {["All levels N5 to N2", "Unlimited questions", "Full mock tests", "Review system"].map(f => (
                  <div key={f} className="flex items-start gap-3"><span className="text-gray-400 text-xl mt-0.5 flex-shrink-0">×</span><span className="text-gray-400 text-sm">{f}</span></div>
                ))}
              </div>
              <Button variant="outline" className="w-full border-[1.5px] border-[#cccccc] text-black hover:bg-gray-50 font-semibold" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </div>

            {/* Monthly */}
            <div className="bg-white rounded-2xl border-2 border-[#cc1f1f] p-8 flex flex-col relative transition-transform duration-300 hover:-translate-y-1" style={{ boxShadow: "0 4px 24px rgba(204,31,31,0.12)" }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#cc1f1f] text-white text-xs font-bold px-4 py-1.5 rounded-full">MOST POPULAR</span>
              </div>
              <div className="mb-6 mt-2">
                <p className="text-[#cc1f1f] text-sm font-semibold uppercase tracking-wide mb-3">MONTHLY</p>
                <div className="mb-2"><span className="text-5xl font-bold text-black">{symbol}{convertPrice(499, currency)}</span><span className="text-gray-600 text-lg">/month</span></div>
                <p className="text-gray-600 text-sm">Billed monthly · cancel anytime</p>
              </div>
              <div className="flex-grow mb-6 space-y-3">
                {["Everything in Free", "All levels N5 to N2", "Unlimited practice questions", "Full mock tests", "Review system", "Priority support", "Cancel anytime"].map(f => (
                  <div key={f} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" /><span className="text-gray-700 text-sm">{f}</span></div>
                ))}
              </div>
              <Button className="w-full bg-[#cc1f1f] hover:bg-[#b01b1b] text-white font-semibold" asChild>
                <Link href="/auth/signup?plan=monthly">Get Monthly Access</Link>
              </Button>
            </div>

            {/* 6 Months */}
            <div className="bg-white rounded-2xl border-2 border-[#f59e0b] p-8 flex flex-col relative transition-transform duration-300 hover:-translate-y-1" style={{ boxShadow: "0 4px 24px rgba(245,158,11,0.1)" }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#f59e0b] text-white text-xs font-bold px-4 py-1.5 rounded-full">BEST VALUE</span>
              </div>
              <div className="mb-6 mt-2">
                <p className="text-[#f59e0b] text-sm font-semibold uppercase tracking-wide mb-3">6 MONTHS</p>
                <div className="mb-2"><span className="text-5xl font-bold text-black">{symbol}{convertPrice(2499, currency)}</span><span className="text-gray-600 text-lg">/6 months</span></div>
                <div className="inline-block bg-[#fff8e6] text-[#d97706] text-xs font-semibold px-3 py-1 rounded-full mb-2">Save {symbol}{convertPrice(495, currency)} vs monthly</div>
              </div>
              <div className="flex-grow mb-6 space-y-3">
                {["Everything in Free", "All levels N5 to N2", "Unlimited practice questions", "Full mock tests", "Review system", "Priority support", "6 months at lower price"].map(f => (
                  <div key={f} className="flex items-start gap-3"><Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" /><span className="text-gray-700 text-sm">{f}</span></div>
                ))}
              </div>
              <Button className="w-full bg-[#f59e0b] hover:bg-[#e08e0a] text-black font-semibold" asChild>
                <Link href="/auth/signup?plan=sixmonth">Get 6 Months Access</Link>
              </Button>
            </div>

          </div>
          <div className="text-center mt-12">
            <p className="text-gray-500 text-[13px]">Secure payment via Stripe · Cancel anytime · No hidden fees</p>
          </div>
        </div>
      </section>

      {/* CTA Section — fixed proportions */}
      <section className="py-14 bg-[#cc1f1f]">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Start your JLPT journey today.
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Create your account and begin studying in minutes.
            </p>
            <Button
              className="bg-white text-[#cc1f1f] hover:bg-gray-100 font-bold px-8 py-3 text-base"
              asChild
            >
              <Link href="/auth/signup">Sign Up Free</Link>
            </Button>
            <p className="text-sm text-white/70 mt-4">
              No credit card required · 3 free questions daily
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
