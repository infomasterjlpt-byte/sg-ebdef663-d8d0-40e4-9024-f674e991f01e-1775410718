import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, ChevronRight } from "lucide-react";
import Image from "next/image";

const LEVEL_DATA: any = {
  n5: {
    level: "N5",
    name: "Beginner",
    description: "Basic grammar patterns and everyday expressions",
    color: "#22c55e",
    bgColor: "bg-green-500",
  },
  n4: {
    level: "N4",
    name: "Elementary",
    description: "Simple conversations and basic reading comprehension",
    color: "#06b6d4",
    bgColor: "bg-cyan-500",
  },
  n3: {
    level: "N3",
    name: "Intermediate",
    description: "Daily life situations and longer written texts",
    color: "#a855f7",
    bgColor: "bg-purple-500",
  },
  n2: {
    level: "N2",
    name: "Upper Intermediate",
    description: "News articles, opinions, and abstract topics",
    color: "#f59e0b",
    bgColor: "bg-amber-500",
  },
  n1: {
    level: "N1",
    name: "Advanced",
    description: "Complex texts and specialized content across domains",
    color: "#ef4444",
    bgColor: "bg-red-500",
  },
};

const CATEGORIES = [
  {
    id: "reading",
    nameJa: "読解",
    nameEn: "Reading",
    totalUnits: 4,
    description: "Comprehension passages and question practice",
  },
  {
    id: "kanji",
    nameJa: "漢字",
    nameEn: "Kanji",
    totalUnits: 4,
    description: "Character readings, meanings, and usage",
  },
  {
    id: "grammar",
    nameJa: "文法",
    nameEn: "Grammar",
    totalUnits: 4,
    description: "Sentence patterns and grammatical structures",
  },
];

export default function LevelDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [mounted, setMounted] = useState(false);
  const [completedUnits, setCompletedUnits] = useState<{ [key: string]: number }>({
    reading: 0,
    kanji: 0,
    grammar: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !id) return null;

  const levelData = LEVEL_DATA[id as string];
  if (!levelData) {
    router.push("/levels");
    return null;
  }

  const totalUnits = CATEGORIES.reduce((sum, cat) => sum + cat.totalUnits, 0);
  const completedTotal = Object.values(completedUnits).reduce((sum, val) => sum + val, 0);
  const overallProgress = Math.round((completedTotal / totalUnits) * 100);

  return (
    <>
      <SEO 
        title={`JLPT ${levelData.level} - Master JLPT`} 
        description={`Practice for JLPT ${levelData.level} - ${levelData.description}`} 
      />
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <Link href="/levels" className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="Master JLPT" 
                width={150}
                height={36}
                className="h-[36px] w-auto"
                priority
              />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="container py-12">
          <div className="max-w-5xl mx-auto">
            {/* Level Header */}
            <div className="text-center mb-12">
              <div 
                className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: levelData.color }}
              >
                <span className="text-white font-bold text-4xl">{levelData.level}</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">JLPT {levelData.level}</h1>
              <p className="text-gray-500 text-lg">
                {levelData.name} • {levelData.description}
              </p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {CATEGORIES.map((category) => {
                const completed = completedUnits[category.id];
                const progress = Math.round((completed / category.totalUnits) * 100);

                return (
                  <Card key={category.id} className="overflow-hidden">
                    <CardContent className="p-6 space-y-4">
                      {/* Category Name */}
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{category.nameJa}</h3>
                        <p className="text-gray-600 font-medium">{category.nameEn}</p>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">
                            {completed}/{category.totalUnits} units
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Start Button */}
                      <Button 
                        className="w-full bg-black hover:bg-gray-800 text-white"
                        onClick={() => router.push(`/practice?level=${id}&category=${category.id}`)}
                      >
                        Start Practicing
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Summary Bar */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-amber-500" />
                    <div>
                      <p className="font-semibold text-lg">Overall Progress</p>
                      <p className="text-sm text-gray-600">
                        {completedTotal} of {totalUnits} units completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold" style={{ color: levelData.color }}>
                      {overallProgress}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-8 mt-12">
          <div className="container text-center">
            <p className="text-sm font-bold text-[#cc1f1f] mb-2">
              Powered by Toki English
            </p>
            <p className="text-xs text-gray-500">
              © 2025 Toki English. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}