import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { BookOpen, Target, Award, Check, Star, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { Footer } from "@/components/Layout/Footer";
import { authService } from "@/services/authService";
import { useCurrency } from "@/contexts/CurrencyContext";

export default function Home() {
  const [currency, setCurrency] = useState<"JPY" | "USD" | "BDT" | "NPR" | "INR" | "VND" | "LKR">("JPY");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const reviews = [
    {
      name: "Tanvir M.",
      flag: "🇧🇩",
      stars: 5,
      level: "N5",
      text: "I passed N5 on my first attempt after just 3 months of using Master JLPT. The kanji drills are incredibly effective and the explanations are clear."
    },
    {
      name: "Nguyen T.",
      flag: "🇻🇳",
      stars: 5,
      level: "N4",
      text: "The reading passages feel exactly like the real exam. I improved my score from 60% to 88% in two months of daily practice."
    },
    {
      name: "Priya S.",
      flag: "🇮🇳",
      stars: 5,
      level: "N3",
      text: "Best JLPT prep resource I have found. The grammar explanations are clear and the mock tests are very realistic. Highly recommend."
    },
    {
      name: "Carlos R.",
      flag: "🇵🇭",
      stars: 4,
      level: "N2",
      text: "Great question bank and easy to track progress. The topic by topic practice helped me focus on my weak areas."
    },
    {
      name: "Li W.",
      flag: "🇨🇳",
      stars: 5,
      level: "N4",
      text: "I study on my phone during my commute every day. The interface is clean and the questions are high quality. Worth every minute."
    },
    {
      name: "Amara K.",
      flag: "🇧🇩",
      stars: 5,
      level: "N4",
      text: "Failed N4 twice before finding this site. The topic by topic practice helped me identify my weak areas. Passed with 82% on my third attempt."
    }
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
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      setIsLoggedIn(!!user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 4000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  // Note: Since Home is the root component and not wrapped in CurrencyProvider in this file,
  // we can't use useCurrency here. We'll handle currency via local state and Context if needed.
  // The previous getCurrencySymbol() call was failing. I'll define it locally if it's used.

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
          <img
            src="/logo.svg"
            alt="Master JLPT"
            width={44}
            height={44}
            style={{ height: '44px', width: '44px', display: 'block', flexShrink: 0 }}
          />
          <span style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1 }}>
            <span style={{ color: '#111111' }}>Master</span>
            <span style={{ color: '#cc1f1f' }}>JLPT</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Select value={currency} onValueChange={(val) => setCurrency(val as any)}>
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
        {/* Red Left Accent Stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-[8px] bg-[#cc1f1f]" />
        
        {/* Japanese Watermark - Behind content */}
        <div 
          className="absolute pointer-events-none select-none" 
          style={{ 
            right: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 0
          }}
        >
          <span 
            className="leading-none"
            style={{
              fontSize: '220px',
              fontWeight: 900,
              color: '#d4d4d4',
              opacity: 0.5
            }}
          >
            日本語
          </span>
        </div>

        {/* Content */}
        <div className="container relative py-20 md:py-32" style={{ zIndex: 1, position: 'relative' }}>
          <div className="max-w-2xl">
            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="block text-[#111111]">Master the JLPT.</span>
              <span className="block">
                <span className="text-[#cc1f1f]">One level</span>
                <span className="text-[#111111]"> at a time.</span>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Structured kanji, grammar, and reading practice for every JLPT level. Study smarter, track your progress, pass your exam.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button size="lg" className="bg-[#cc1f1f] hover:bg-[#b01b1b] text-white px-8" asChild>
                <Link href="/levels">Start Learning</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-[#cc1f1f] hover:text-[#cc1f1f]" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-[#cc1f1f]" />
                <span>N5 to N1</span>
              </div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-[#cc1f1f]" />
                <span>Track Progress</span>
              </div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-[#cc1f1f]" />
                <span>Mock Tests</span>
              </div>
              <span className="text-gray-300">·</span>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="h-4 w-4 text-[#cc1f1f]" />
                <span>Review System</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#f8f8f8]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#111111] mb-4">Everything you need to pass the JLPT</h2>
            <p className="text-gray-600 text-lg">
              Comprehensive tools and resources for every level
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-red-50">
                    <BookOpen className="h-8 w-8 text-[#cc1f1f]" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-[#111111]">Practice Questions</h3>
                <p className="text-gray-600">
                  Thousands of questions across kanji, grammar, vocabulary, and reading comprehension
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-red-50">
                    <Target className="h-8 w-8 text-[#cc1f1f]" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-[#111111]">Progress Tracking</h3>
                <p className="text-gray-600">
                  Monitor your daily progress, study streaks, and category performance
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-red-50">
                    <Award className="h-8 w-8 text-[#cc1f1f]" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-[#111111]">Mock Tests</h3>
                <p className="text-gray-600">
                  Full-length practice exams with realistic timing and difficulty
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-20 bg-[#f8f8f8]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#111111] mb-4">Choose your level</h2>
            <p className="text-gray-600 text-lg">
              Click any level to see the full syllabus and available practice questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {/* N5 Card */}
            <Link href="/levels/n5" className="group">
              <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full" style={{ borderTop: '4px solid #22c55e' }}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold" style={{ color: '#22c55e' }}>N5</div>
                  <h3 className="font-bold text-xl text-[#111111]">Beginner</h3>
                  <p className="text-gray-600 text-sm">Perfect starting point</p>
                  <div className="pt-2">
                    <span className="text-[#cc1f1f] text-sm font-medium">View Syllabus →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* N4 Card */}
            <Link href="/levels/n4" className="group">
              <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full" style={{ borderTop: '4px solid #14b8a6' }}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold" style={{ color: '#14b8a6' }}>N4</div>
                  <h3 className="font-bold text-xl text-[#111111]">Elementary</h3>
                  <p className="text-gray-600 text-sm">Elementary</p>
                  <div className="pt-2">
                    <span className="text-[#cc1f1f] text-sm font-medium">View Syllabus →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* N3 Card */}
            <Link href="/levels/n3" className="group">
              <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full" style={{ borderTop: '4px solid #8b5cf6' }}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold" style={{ color: '#8b5cf6' }}>N3</div>
                  <h3 className="font-bold text-xl text-[#111111]">Intermediate</h3>
                  <p className="text-gray-600 text-sm">Intermediate</p>
                  <div className="pt-2">
                    <span className="text-[#cc1f1f] text-sm font-medium">View Syllabus →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* N2 Card */}
            <Link href="/levels/n2" className="group">
              <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full" style={{ borderTop: '4px solid #f59e0b' }}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold" style={{ color: '#f59e0b' }}>N2</div>
                  <h3 className="font-bold text-xl text-[#111111]">Upper Intermediate</h3>
                  <p className="text-gray-600 text-sm">Upper intermediate</p>
                  <div className="pt-2">
                    <span className="text-[#cc1f1f] text-sm font-medium">View Syllabus →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* N1 Card */}
            <Link href="/levels/n1" className="group">
              <Card className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer h-full" style={{ borderTop: '4px solid #991b1b' }}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl font-bold" style={{ color: '#991b1b' }}>N1</div>
                  <h3 className="font-bold text-xl text-[#111111]">Advanced</h3>
                  <p className="text-gray-600 text-sm">Advanced</p>
                  <div className="pt-2">
                    <span className="text-[#cc1f1f] text-sm font-medium">View Syllabus →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-gray-600 text-lg">
              Your path to JLPT success in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[#cc1f1f] flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="font-bold text-lg">Choose Your Level</h3>
              <p className="text-gray-600 text-sm">
                Select your target JLPT level from N5 to N1
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[#cc1f1f] flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="font-bold text-lg">Practice Daily</h3>
              <p className="text-gray-600 text-sm">
                Answer questions and build your knowledge
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[#cc1f1f] flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="font-bold text-lg">Track Progress</h3>
              <p className="text-gray-600 text-sm">
                Monitor your improvement with detailed stats
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[#cc1f1f] flex items-center justify-center text-white text-2xl font-bold">
                  4
                </div>
              </div>
              <h3 className="font-bold text-lg">Pass Your Exam</h3>
              <p className="text-gray-600 text-sm">
                Take the JLPT with confidence
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Dynamic Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-black mb-4">
              What our learners say
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of JLPT learners worldwide
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative max-w-7xl mx-auto">
            {/* Navigation Arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors hidden md:block"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors hidden md:block"
              aria-label="Next reviews"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>

            {/* Reviews Track */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="min-w-full flex gap-6 px-2"
                  >
                    {/* Desktop: 3 cards */}
                    <div className="hidden md:grid md:grid-cols-3 gap-6 w-full">
                      {reviews.slice(slideIndex * 3, slideIndex * 3 + 3).map((review, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7"
                        >
                          {/* Stars */}
                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.stars
                                    ? "fill-[#cc1f1f] text-[#cc1f1f]"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Review Text */}
                          <p className="text-[#555555] text-[15px] leading-[1.6] italic mb-6">
                            &ldquo;{review.text}&rdquo;
                          </p>

                          {/* Author Info */}
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{review.flag}</span>
                            <span className="font-bold text-gray-900">
                              {review.name}
                            </span>
                            <span
                              className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                                levelColors[review.level].bg
                              } ${levelColors[review.level].text}`}
                            >
                              {review.level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Mobile: 1 card */}
                    <div className="md:hidden w-full">
                      {reviews.slice(slideIndex * 3, slideIndex * 3 + 1).map((review, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7"
                        >
                          {/* Stars */}
                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.stars
                                    ? "fill-[#cc1f1f] text-[#cc1f1f]"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Review Text */}
                          <p className="text-[#555555] text-[15px] leading-[1.6] italic mb-6">
                            &ldquo;{review.text}&rdquo;
                          </p>

                          {/* Author Info */}
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{review.flag}</span>
                            <span className="font-bold text-gray-900">
                              {review.name}
                            </span>
                            <span
                              className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
                                levelColors[review.level].bg
                              } ${levelColors[review.level].text}`}
                            >
                              {review.level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-[#cc1f1f] w-8"
                      : "bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Average Rating */}
          <div className="text-center mt-8">
            <p className="text-[#888888] text-[13px]">
              ★★★★★ Average 4.9 out of 5 from our learners
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-[#f8f8f8]">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-lg text-gray-600">
              Start free. Upgrade when you are ready.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div
              className="bg-white rounded-2xl border border-[#e5e5e5] p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
            >
              <div className="mb-6">
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-3">
                  FREE
                </p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-black">{symbol}0</span>
                  <span className="text-gray-600 text-lg">/month</span>
                </div>
                <p className="text-gray-600 text-sm">Start learning for free</p>
              </div>

              <div className="flex-grow mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">N5 Practice Questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Kanji Grammar & Reading</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Track your progress</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Group by topic practice</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl mt-0.5 flex-shrink-0">×</span>
                  <span className="text-gray-400 text-sm">All levels N5 to N2</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl mt-0.5 flex-shrink-0">×</span>
                  <span className="text-gray-400 text-sm">Unlimited questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl mt-0.5 flex-shrink-0">×</span>
                  <span className="text-gray-400 text-sm">Full mock tests</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-gray-400 text-xl mt-0.5 flex-shrink-0">×</span>
                  <span className="text-gray-400 text-sm">Review system</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-[1.5px] border-[#cccccc] text-black hover:bg-gray-50 font-semibold"
                asChild
              >
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>

            {/* Monthly Plan - MOST POPULAR */}
            <div
              className="bg-white rounded-2xl border-2 border-[#cc1f1f] p-8 flex flex-col relative transition-transform duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 4px 24px rgba(204,31,31,0.12)" }}
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#cc1f1f] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  MOST POPULAR
                </span>
              </div>

              <div className="mb-6 mt-2">
                <p className="text-[#cc1f1f] text-sm font-semibold uppercase tracking-wide mb-3">
                  MONTHLY
                </p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-black">{symbol}499</span>
                  <span className="text-gray-600 text-lg">/month</span>
                </div>
                <p className="text-gray-600 text-sm">Billed monthly · cancel anytime</p>
              </div>

              <div className="flex-grow mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Everything in Free</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">All levels N5 to N2</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Unlimited practice questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Full mock tests</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Review system</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#cc1f1f] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Cancel anytime</span>
                </div>
              </div>

              <Button
                className="w-full bg-[#cc1f1f] hover:bg-[#b01b1b] text-white font-semibold"
                asChild
              >
              <Link href="/auth/signup?plan=monthly">
                  Get Monthly Access
                </Link>
              </Button>
            </div>

            {/* 6 Months Plan - BEST VALUE */}
            <div
              className="bg-white rounded-2xl border-2 border-[#f59e0b] p-8 flex flex-col relative transition-transform duration-300 hover:-translate-y-1"
              style={{ boxShadow: "0 4px 24px rgba(245,158,11,0.1)" }}
            >
              {/* Best Value Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#f59e0b] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  BEST VALUE
                </span>
              </div>

              <div className="mb-6 mt-2">
                <p className="text-[#f59e0b] text-sm font-semibold uppercase tracking-wide mb-3">
                  6 MONTHS
                </p>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-black">{symbol}2,499</span>
                  <span className="text-gray-600 text-lg">/6 months</span>
                </div>
                <div className="inline-block bg-[#fff8e6] text-[#d97706] text-xs font-semibold px-3 py-1 rounded-full mb-2">
                  Save {symbol}495 vs monthly
                </div>
              </div>

              <div className="flex-grow mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Everything in Free</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">All levels N5 to N2</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Unlimited practice questions</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Full mock tests</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Review system</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">Priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">6 months at lower price</span>
                </div>
              </div>

              <Button
                className="w-full bg-[#f59e0b] hover:bg-[#e08e0a] text-black font-semibold"
                asChild
              >
               <Link href="/auth/signup?plan=sixmonth">
                  Get 6 Months Access
                </Link>
              </Button>
            </div>
          </div>

          {/* Footer Text */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-[13px]">
              Secure payment via Stripe · Cancel anytime · No hidden fees
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#cc1f1f]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Start your JLPT journey today.
            </h2>
            <p className="text-xl text-white/90">
              Create your account and begin studying in minutes.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                className="bg-white text-[#cc1f1f] hover:bg-gray-100 text-lg px-12 py-6 h-auto font-bold"
                asChild
              >
                <Link href="/auth/signup">Sign Up Free</Link>
              </Button>
            </div>
            <p className="text-sm text-white/80">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
