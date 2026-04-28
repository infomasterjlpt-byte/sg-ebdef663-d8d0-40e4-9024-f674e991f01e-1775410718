import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BookOpen } from "lucide-react";

const categoryNames: Record<string, string> = {
  kanji: "Kanji",
  grammar: "Grammar",
  reading: "Reading"
};

const categoryIcons: Record<string, string> = {
  kanji: "漢字",
  grammar: "文法",
  reading: "読解"
};

interface GroupData {
  group: string;
  total: number;
  answered: number;
}

export default function CategoryGroupsPage() {
  const router = useRouter();
  const { category } = router.query;
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      if (!category || typeof category !== "string") return;

      const user = await authService.getCurrentUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      // Get selected level from localStorage (set by header)
      const selectedLevel = localStorage.getItem("selectedLevel") || "N5";
      setUserLevel(selectedLevel);

      // Fetch all groups for this level and category
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("group")
        .eq("level", selectedLevel)
        .eq("category", category);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        setLoading(false);
        return;
      }

      // Count questions per group
      const groupCounts: { [key: string]: number } = {};
      questionsData?.forEach((q: any) => {
        const groupName = q.group || "Ungrouped";
        groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
      });

      // Fetch progress for each group
      const groupsWithProgress = await Promise.all(
        Object.entries(groupCounts).map(async ([groupName, total]) => {
          const { data: progressData } = await supabase
            .from("practice_sessions")
            .select("question_id")
            .eq("user_id", user.id)
            .eq("level", selectedLevel)
            .eq("category", category)
            .eq("group_name", groupName)
            .eq("is_correct", true);

          const uniqueAnswered = new Set(progressData?.map(p => p.question_id) || []);

          return {
            group: groupName,
            total,
            answered: uniqueAnswered.size
          };
        })
      );

      setGroups(groupsWithProgress.sort((a, b) => a.group.localeCompare(b.group)));
      setLoading(false);
    };

    loadGroups();

    // Listen for level changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedLevel") {
        loadGroups();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [category, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading groups...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const categoryName = category ? categoryNames[category as string] || category : "";
  const categoryIcon = category ? categoryIcons[category as string] || "" : "";

  return (
    <AppLayout>
      <SEO 
        title={`${categoryName} Practice - Master JLPT`}
        description={`Practice ${categoryName} questions for JLPT ${userLevel}`}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">
            Practice
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryName}</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/practice">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{categoryIcon}</span>
            <h1 className="text-3xl font-bold">{categoryName}</h1>
          </div>
          {userLevel && (
            <p className="text-lg text-muted-foreground">
              Level: <span className="font-semibold text-foreground">{userLevel}</span>
            </p>
          )}
        </div>

        {groups.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No groups available</h3>
            <p className="text-muted-foreground">
              There are no practice groups available for this category yet.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link
                key={group.group}
                href={`/practice/${category}/${encodeURIComponent(group.group)}`}
                className="block group"
              >
                <Card className="h-full p-6 bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex flex-col h-full">
                    <h3 className="text-xl font-bold mb-2">{group.group}</h3>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <span>{group.total} questions</span>
                      {group.answered > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            {group.answered} answered
                          </span>
                        </>
                      )}
                    </div>

                    {group.answered > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{Math.round((group.answered / group.total) * 100)}%</span>
                        </div>
                        <Progress value={(group.answered / group.total) * 100} className="h-2" />
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                        Start Practice
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
