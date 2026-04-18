import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  BookOpen, 
  Brain, 
  Clock, 
  TrendingUp, 
  Check, 
  Star,
  Lock,
  Zap,
  Target,
  Award,
  Globe,
  Crown
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Practice Mode",
    description: "Choose your level, get instant explanations for every answer. Build mastery one question at a time.",
  },
  {
    icon: Brain,
    title: "Smart Review",
    description: "App remembers your wrong answers and repeats them until mastered. Never forget what you've learned.",
  },
  {
    icon: Clock,
    title: "Mock Tests",
    description: "Full timed JLPT-style exams with detailed results. Experience the real test before exam day.",
  },
];

const LEVELS = [
  {
    level: "N5",
    difficulty: "Beginner",
    kanji: 100,
    vocab: 800,
    grammar: 285,
    reading: 212,
    total: 997,
    isFree: false,
    color: "bg-level-n5",
  },
  {
    level: "N4",
    difficulty: "Elementary",
    kanji: 300,
    vocab: 1500,
    grammar: 300,
    reading: 250,
    total: 2350,
    isFree: false,
    color: "bg-level-n4",
  },
  {
    level: "N3",
    difficulty: "Intermediate",
    kanji: 650,
    vocab: 3700,
    grammar: 350,
    reading: 300,
    total: 5000,
    isFree: false,
    color: "bg-level-n3",
  },
  {
    level: "N2",
    difficulty: "Upper Intermediate",
    kanji: 1000,
    vocab: 6000,
    grammar: 400,
    reading: 350,
    total: 7750,
    isFree: false,
    color: "bg-level-n2",
  },
  {
    level: "N1",
    difficulty: "Advanced",
    kanji: 2000,
    vocab: 10000,
    grammar: 450,
    reading: 400,
    total: 12850,
    isFree: false,
    color: "bg-level-n1",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    level: "N3",
    text: "The smart review system helped me remember kanji I kept forgetting. Passed N3 on my first try!",
    rating: 5,
  },
  {
    name: "Miguel Rodriguez",
    level: "N5",
    text: "Perfect for beginners. The explanations are clear and the daily goal keeps me motivated.",
    rating: 5,
  },
  {
    name: "Yuki Tanaka",
    level: "N2",
    text: "Mock tests feel exactly like the real exam. The timer pressure helped me prepare mentally.",
    rating: 5,
  },
];

export default function Landing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { currency, setCurrency, convertPrice, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      router.push("/dashboard");
    }
  }

  const monthlyPrice = 499;
  const sixMonthPrice = 2499;
  const symbol = getCurrencySymbol();

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

      {/* Reviews Section */}
      <section className="py-20 bg-white" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Trusted by JLPT learners worldwide</h2>
            <p className="text-gray-600 text-lg">
              Join thousands of students who have improved their Japanese skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                level: "N3 Student",
                review: "The structured approach helped me pass N3 on my first try. The mock tests were especially helpful for time management.",
                rating: 5,
              },
              {
                name: "David Kim",
                level: "N2 Student",
                review: "Best JLPT preparation platform I've used. The explanations are clear and the progress tracking keeps me motivated.",
                rating: 5,
              },
              {
                name: "Maria Santos",
                level: "N5 Student",
                review: "Perfect for beginners! The practice questions are well-organized and the review system helps me remember what I learned.",
                rating: 5,
              },
            ].map((review, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#f59e0b] text-[#f59e0b]" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed">"{review.review}"</p>
                  <div>
                    <p className="font-bold">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.level}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="text-center space-y-4">
            <p className="text-sm font-bold text-[#cc1f1f]">
              Powered by Toki English
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              © 2025 Toki English. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
              JLPT is a trademark of the Japan Foundation and Japan Educational Exchanges and Services. 
              This app is not affiliated with or endorsed by the Japan Foundation.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Privacy Policy
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}