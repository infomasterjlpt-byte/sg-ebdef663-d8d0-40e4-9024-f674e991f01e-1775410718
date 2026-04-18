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
  level: "N4",
  name: "Elementary",
  description: "Build on your basics and expand your Japanese skills",
  color: "#14b8a6",
  categories: [
    {
      id: "kanji",
      icon: "漢字",
      name: "Kanji",
      description: "Intermediate kanji characters and compound words",
      questions: 1025,
    },
    {
      id: "grammar",
      icon: "文法",
      name: "Grammar",
      description: "More complex grammar patterns",
      questions: 249,
    },
    {
      id: "reading",
      icon: "読解",
      name: "Reading",
      description: "Short passages on familiar topics",
      questions: 500,
    },
  ],
  whatYouLearn: [
    "Intermediate vocabulary (1,500 words)",
    "Kanji (181 new characters)",
    "More complex grammar",
    "Reading short passages on familiar topics",
    "Basic conversations",
  ],
};

const LEVELS = [
  { id: "n5", name: "N5", color: "#22c55e" },
  { id: "n4", name: "N4", color: "#14b8a6" },
  { id: "n3", name: "N3", color: "#8b5cf6" },
  { id: "n2", name: "N2", color: "#f59e0b" },
  { id: "n1", name: "N1", color: "#991b1b" },
];

export default function N4Page() {
  const router = useRouter();

  return (
    <>
      <SEO 
        title="JLPT N4 - Elementary Level - Master JLPT" 
        description="Advance your Japanese with JLPT N4. Practice kanji, grammar, and reading with 1,774 questions."
      />

      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
            <Link href="/levels" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              </div>
            </Link>
          </div>
        </header>

        <BackButton />

        {/* Hero Header */}
        <div className="bg-white border-l-[8px] border-[#14b8a6]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          <div className="container py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="text-6xl font-bold" style={{ color: '#14b8a6' }}>N4</div>
                <h1 className="text-3xl font-bold text-[#111111]">Elementary Level</h1>
                <p className="text-gray-600">Build on your foundation with elementary Japanese</p>
              </div>
              <Button 
                className="bg-[#cc1f1f] hover:bg-[#b01b1b] text-white px-8 py-6 text-lg"
                asChild
              >
                <Link href="/practice?level=N4">Start Practicing Today →</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Level Selector Pills */}
        <div className="bg-[#f8f8f8] py-6" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          <div className="container">
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/levels/n5">
                <Badge variant="outline" className="px-6 py-2 text-base cursor-pointer border-2">N5</Badge>
              </Link>
              <Link href="/levels/n4">
                <Badge className="px-6 py-2 text-base cursor-pointer" style={{ backgroundColor: '#14b8a6', color: 'white' }}>N4</Badge>
              </Link>
              <Link href="/levels/n3">
                <Badge variant="outline" className="px-6 py-2 text-base cursor-pointer border-2">N3</Badge>
              </Link>
              <Link href="/levels/n2">
                <Badge variant="outline" className="px-6 py-2 text-base cursor-pointer border-2">N2</Badge>
              </Link>
              <Link href="/levels/n1">
                <Badge variant="outline" className="px-6 py-2 text-base cursor-pointer border-2">N1</Badge>
              </Link>
            </div>
          </div>
        </div>

        {/* Syllabus Cards */}
        <section className="py-16 bg-white" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          <div className="container">
            <h2 className="text-3xl font-bold text-[#111111] mb-8">Course Syllabus</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kanji Card */}
              <Card className="border border-gray-200 border-t-[3px]" style={{ borderTopColor: '#14b8a6' }}>
                <CardContent className="p-8 space-y-4">
                  <div className="text-6xl text-center" style={{ color: '#14b8a6' }}>漢字</div>
                  <h3 className="text-2xl font-bold text-center">Kanji</h3>
                  <p className="text-gray-600 text-center">
                    Expanded kanji for everyday communication
                  </p>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold" style={{ color: '#14b8a6' }}>1,025</div>
                    <div className="text-sm text-gray-600">Practice Questions</div>
                  </div>
                  <Button className="w-full" style={{ backgroundColor: '#14b8a6' }} asChild>
                    <Link href="/practice?level=N4&category=kanji">Practice Kanji</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Grammar Card */}
              <Card className="border border-gray-200 border-t-[3px]" style={{ borderTopColor: '#14b8a6' }}>
                <CardContent className="p-8 space-y-4">
                  <div className="text-6xl text-center" style={{ color: '#14b8a6' }}>文法</div>
                  <h3 className="text-2xl font-bold text-center">Grammar</h3>
                  <p className="text-gray-600 text-center">
                    More complex grammar structures
                  </p>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold" style={{ color: '#14b8a6' }}>249</div>
                    <div className="text-sm text-gray-600">Practice Questions</div>
                  </div>
                  <Button className="w-full" style={{ backgroundColor: '#14b8a6' }} asChild>
                    <Link href="/practice?level=N4&category=grammar">Practice Grammar</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Reading Card */}
              <Card className="border border-gray-200 border-t-[3px]" style={{ borderTopColor: '#14b8a6' }}>
                <CardContent className="p-8 space-y-4">
                  <div className="text-6xl text-center" style={{ color: '#14b8a6' }}>読解</div>
                  <h3 className="text-2xl font-bold text-center">Reading</h3>
                  <p className="text-gray-600 text-center">
                    Short passages on familiar topics
                  </p>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold" style={{ color: '#14b8a6' }}>500</div>
                    <div className="text-sm text-gray-600">Practice Questions</div>
                  </div>
                  <Button className="w-full" style={{ backgroundColor: '#14b8a6' }} asChild>
                    <Link href="/practice?level=N4&category=reading">Practice Reading</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* What You'll Learn */}
        <section className="py-16 bg-[#f8f8f8]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          <div className="container">
            <h2 className="text-3xl font-bold text-[#111111] mb-8">What You'll Learn</h2>
            <div className="max-w-3xl">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#14b8a6] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Intermediate vocabulary (1,500 words)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#14b8a6] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Kanji (181 new characters)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#14b8a6] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">More complex grammar</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#14b8a6] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Reading short passages on familiar topics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-[#14b8a6] flex-shrink-0 mt-1" />
                  <span className="text-lg text-gray-700">Basic conversations</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-[#cc1f1f]" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          <div className="container">
            <div className="text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to start? Begin practicing N4 now.
              </h2>
              <Button 
                size="lg" 
                className="bg-white text-[#cc1f1f] hover:bg-gray-100 px-12 py-6 h-auto text-lg font-bold"
                asChild
              >
                <Link href="/practice?level=N4">Start Practicing →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-8" style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          <div className="container">
            <p className="text-center text-gray-600 text-sm">
              © {new Date().getFullYear()} Master JLPT. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}