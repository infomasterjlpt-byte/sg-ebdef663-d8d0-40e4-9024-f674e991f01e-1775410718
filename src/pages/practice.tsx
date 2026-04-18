import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { ArrowRight, BookOpen, Languages, FileText } from "lucide-react";

interface Category {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const categories: Category[] = [
  {
    id: "kanji",
    icon: "漢字",
    title: "Kanji",
    description: "Practice kanji reading and meaning"
  },
  {
    id: "grammar",
    icon: "文法",
    title: "Grammar",
    description: "Master grammar patterns and structures"
  },
  {
    id: "reading",
    icon: "読解",
    title: "Reading",
    description: "Improve reading comprehension skills"
  }
];

export default function PracticePage() {
  const router = useRouter();
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Get user's current level
      const profile = await userService.getUserProfile(user.id);
      if (profile) {
        setUserLevel(profile.current_level);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO 
        title="Practice - Master JLPT"
        description="Practice JLPT questions by category"
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Practice</h1>
          {userLevel && (
            <p className="text-lg text-muted-foreground">
              Current Level: <span className="font-semibold text-foreground">{userLevel.toUpperCase()}</span>
            </p>
          )}
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/practice/${category.id}`}
              className="block group"
            >
              <Card className="h-full p-6 bg-white border border-gray-200 border-t-4 border-t-primary hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  {/* Icon */}
                  <div className="text-5xl font-bold mb-4 text-primary">
                    {category.icon}
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-2">
                    {category.title}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className="flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                    <span className="font-medium">Start Practice</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}