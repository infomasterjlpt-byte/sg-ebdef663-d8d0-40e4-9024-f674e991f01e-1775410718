import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronRight, Info } from "lucide-react";

const LEVELS = [
  {
    id: "n5",
    level: "N5",
    name: "Beginner",
    description: "Basic grammar and everyday expressions",
    color: "#22c55e",
    bgColor: "bg-green-500",
  },
  {
    id: "n4",
    level: "N4",
    name: "Elementary",
    description: "Simple conversations and basic reading",
    color: "#06b6d4",
    bgColor: "bg-cyan-500",
  },
  {
    id: "n3",
    level: "N3",
    name: "Intermediate",
    description: "Daily life situations and longer texts",
    color: "#a855f7",
    bgColor: "bg-purple-500",
  },
  {
    id: "n2",
    level: "N2",
    name: "Upper Intermediate",
    description: "News, articles, and abstract topics",
    color: "#f59e0b",
    bgColor: "bg-amber-500",
  },
  {
    id: "n1",
    level: "N1",
    name: "Advanced",
    description: "Complex texts and specialized content",
    color: "#ef4444",
    bgColor: "bg-red-500",
  },
];

export default function Levels() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <SEO title="Choose Your Level - Master JLPT" description="Select your JLPT level and start practicing" />
      
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Master JLPT" 
                style={{ height: '40px', width: 'auto' }}
              />
            </Link>
          </div>
        </header>

        <div className="bg-blue-50 border-b border-blue-100">
          <div className="container py-4">
            <Alert className="bg-transparent border-0">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Try 5 free questions</strong> — no account needed
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="container py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-3">Choose Your Level</h1>
              <p className="text-gray-600 text-lg">
                Select your target JLPT level to start practicing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {LEVELS.map((levelData) => (
                <Card 
                  key={levelData.id}
                  className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  style={{ borderTop: `4px solid ${levelData.color}` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: levelData.color }}
                    >
                      <span className="text-white font-bold text-2xl">{levelData.level}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-1">{levelData.level}</h3>
                      <p className="text-gray-500 text-sm mb-2">{levelData.name}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {levelData.description}
                      </p>
                    </div>

                    <Link 
                      href={`/level/${levelData.id}`}
                      className="flex items-center gap-1 text-[#cc1f1f] font-medium text-sm hover:gap-2 transition-all"
                    >
                      Start
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

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