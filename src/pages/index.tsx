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
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.svg" 
              alt="Master JLPT" 
              style={{ height: '40px', width: 'auto' }}
            />
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
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
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
        <div className="container relative py-20 md:py-32" style={{ zIndex: 1 }}>
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
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to pass</h2>
            <p className="text-muted-foreground text-lg">Comprehensive tools designed for serious learners</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section className="py-20 bg-[#f8f8f8]">
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free with 3 questions/day, upgrade anytime</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground pt-2">
                  {symbol}0<span className="text-base font-normal text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>3 questions per day</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>N5 level only (limited)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Basic progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Daily streak counter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Smart review system</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/signup">Start Free</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Monthly */}
            <Card className="border-2 border-accent relative overflow-hidden">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Crown className="h-6 w-6 text-accent" />
                  Premium
                </CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground pt-2">
                  {symbol}{convertPrice(monthlyPrice)}<span className="text-base font-normal text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="font-semibold">All levels: N5, N4, N3, N2, N1</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="font-semibold">Unlimited questions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Full mock exams (all levels)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Weak word lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Study time graphs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>Predicted score</span>
                  </li>
                </ul>
                <Button className="w-full" asChild>
                  <Link href="/auth/signup">Go Premium</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plus 6 Months */}
            <Card className="border-2 border-primary relative overflow-hidden">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1 flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Best Value
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Zap className="h-6 w-6 text-primary" />
                  Premium Plus
                </CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground pt-2">
                  {symbol}{convertPrice(sixMonthPrice)}<span className="text-base font-normal text-muted-foreground">/6 months</span>
                </CardDescription>
                <p className="text-sm text-muted-foreground">
                  Save {symbol}{convertPrice(monthlyPrice * 6 - sixMonthPrice)} vs monthly
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-semibold">Everything in Premium</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-semibold">6 months access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Weak kanji/vocab lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Predicted JLPT score</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Personalized study plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Priority email support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>Early access to features</span>
                  </li>
                </ul>
                <Button className="w-full bg-primary hover:bg-primary/90" asChild>
                  <Link href="/auth/signup">Get Premium Plus</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-surface">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by students worldwide</h2>
            <p className="text-muted-foreground text-lg">See what learners are saying</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <CardDescription className="text-foreground italic">
                    "{testimonial.text}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.level} Student</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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