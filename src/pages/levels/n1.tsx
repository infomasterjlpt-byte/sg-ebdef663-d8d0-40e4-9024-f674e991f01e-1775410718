import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Check } from "lucide-react";

const LEVEL_DATA = {
  level: "N1",
  name: "Advanced",
  description: "Master fluent, professional-level Japanese",
  color: "#991b1b",
  categories: [
    {
      id: "kanji",
      icon: "漢字",
      name: "Kanji",
      description: "All jouyou kanji and specialized characters",
      questions: 0,
      comingSoon: true,
    },
    {
      id: "grammar",
      icon: "文法",
      name: "Grammar",
      description: "Advanced grammar and subtle nuances",
      questions: 0,
      comingSoon: true,
    },
    {
      id: "reading",
      icon: "読解",
      name: "Reading",
      description: "Complex literary and academic texts",
      questions: 0,
      comingSoon: true,
    },
  ],
  whatYouLearn: [
    "Fluent-level vocabulary (10,000+ words)",
    "All kanji",
    "Advanced grammar and nuance",
    "Reading complex literary and academic texts",
    "Understanding lectures and broadcasts",
  ],
};

const LEVELS = [
  { id: "n5", name: "N5", color: "#22c55e" },
  { id: "n4", name: "N4", color: "#14b8a6" },
  { id: "n3", name: "N3", color: "#8b5cf6" },
  { id: "n2", name: "N2", color: "#f59e0b" },
  { id: "n1", name: "N1", color: "#991b1b" },
];

export default function N1Page() {
  const router = useRouter();

  return (
    <>
      <SEO 
        title="JLPT N1 - Advanced Level - Master JLPT" 
        description="Master fluent, professional-level Japanese with JLPT N1. Coming soon."
      />

      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <Link href="/levels" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/logo.svg"
                  alt="Master JLPT"
                  style={{ height: '28px', width: 'auto', display: 'block' }}
                />
                <span style={{ fontSize: '22px', fontWeight: 800, lineHeight: '28px' }}>
                  <span style={{ color: '#111111' }}>Master</span>
                  <span style={{ color: '#cc1f1f' }}>JLPT</span>
                </span>
              </div>
            </Link>
          </div>
        </header>

        <BackButton />

        <section className="relative bg-white border-b">
          <div className="absolute left-0 top-0 bottom-0 w-[8px]" style={{ backgroundColor: LEVEL_DATA.color }} />
          <div className="container py-12 pl-12">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="text-6xl font-bold"
                  style={{ color: LEVEL_DATA.color }}
                >
                  {LEVEL_DATA.level}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#111111]">{LEVEL_DATA.name}</h1>
                  <p className="text-gray-600">{LEVEL_DATA.description}</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gray-200 text-gray-600 text-base px-6 py-2">
                Coming Soon
              </Badge>
            </div>
          </div>
        </section>

        <section className="border-b bg-gray-50">
          <div className="container py-6">
            <div className="flex items-center gap-3 justify-center">
              {LEVELS.map((lvl) => (
                <Link key={lvl.id} href={`/levels/${lvl.id}`}>
                  <Button
                    variant={lvl.id === "n1" ? "default" : "outline"}
                    className={lvl.id === "n1" ? "font-bold" : ""}
                    style={lvl.id === "n1" ? { backgroundColor: lvl.color, color: 'white' } : {}}
                  >
                    {lvl.name}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">What's Covered</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {LEVEL_DATA.categories.map((category) => (
                  <Card 
                    key={category.id} 
                    className="border border-gray-200"
                    style={{ borderTop: `3px solid ${LEVEL_DATA.color}` }}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="text-6xl font-bold text-gray-400">
                        {category.icon}
                      </div>
                      <h3 className="text-xl font-bold">{category.name}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                      <div className="pt-2">
                        <Badge variant="secondary" className="text-sm bg-gray-200 text-gray-600">
                          Coming Soon
                        </Badge>
                      </div>
                      <Button 
                        className="w-full"
                        disabled
                        variant="secondary"
                      >
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">What You'll Learn</h2>
              <div className="space-y-4">
                {LEVEL_DATA.whatYouLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-[#991b1b] flex-shrink-0 mt-1" />
                    <p className="text-lg text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-100">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-4xl font-bold text-gray-700">
                N1 content coming soon
              </h2>
              <p className="text-lg text-gray-600">
                We're working hard to bring you the most comprehensive N1 preparation materials. Sign up to be notified when N1 becomes available.
              </p>
              <Button 
                size="lg" 
                className="bg-[#cc1f1f] hover:bg-[#b01b1b] text-white text-lg px-12 py-6 h-auto font-bold"
                asChild
              >
                <Link href="/auth/signup">
                  Get Notified <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200 bg-white py-8">
          <div className="container text-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Master JLPT. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}