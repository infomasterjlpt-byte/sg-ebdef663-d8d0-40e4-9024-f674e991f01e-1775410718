import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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
  Award
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
    isFree: true,
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

  return (
    <>
      <SEO 
        title="JLPT Master - AI-Powered Japanese Exam Prep" 
        description="Master the JLPT with AI-powered practice for N5 to N1. Track your progress, fix your weak points, and pass your exam."
      />
      
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-2xl">J</span>
            </div>
            <div>
              <div className="font-bold text-lg leading-none">JLPT Master</div>
              <div className="text-xs text-muted-foreground">by Toki English</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
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
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-surface">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Master the JLPT.<br />One level at a time.
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered practice for N5 to N1. Track your progress, fix your weak points, and pass your exam.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/auth/signup">Start Free — N5</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#pricing">See Pricing</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground pt-6">
              <span className="font-semibold text-foreground">997 N5 questions</span>
              <span>·</span>
              <span>Kanji</span>
              <span>·</span>
              <span>Grammar</span>
              <span>·</span>
              <span>Vocabulary</span>
              <span>·</span>
              <span>Reading</span>
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
      <section className="py-20 bg-surface">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose your level</h2>
            <p className="text-muted-foreground text-lg">From beginner to advanced — we have you covered</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {LEVELS.map((level) => (
              <Card key={level.level} className="relative overflow-hidden">
                {!level.isFree && (
                  <div className="absolute top-3 right-3">
                    <Lock className="h-4 w-4 text-muted-foreground opacity-35" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${level.color} text-white`}>{level.level}</Badge>
                    {level.isFree ? (
                      <Badge variant="outline" className="border-green-600 text-green-600">Free</Badge>
                    ) : (
                      <Badge variant="outline" className="border-accent text-accent">Premium</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{level.difficulty}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kanji:</span>
                    <span className="font-semibold">{level.kanji.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vocabulary:</span>
                    <span className="font-semibold">{level.vocab.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grammar:</span>
                    <span className="font-semibold">{level.grammar}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reading:</span>
                    <span className="font-semibold">{level.reading}</span>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{level.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground text-lg">Start free with N5, upgrade anytime</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground pt-2">
                  $0<span className="text-base font-normal text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>N5 level only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>20 questions per day</span>
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

            {/* Premium Plan */}
            <Card className="border-2 border-accent relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-accent text-accent-foreground px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription className="text-3xl font-bold text-foreground pt-2">
                  $5<span className="text-base font-normal text-muted-foreground">/month</span>
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
            <p className="text-sm">
              Powered by <span className="text-accent font-bold">Toki English</span>
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Toki English. All rights reserved.
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