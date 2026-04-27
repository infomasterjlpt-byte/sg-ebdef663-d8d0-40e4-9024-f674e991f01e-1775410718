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

      // Get user's level from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("level")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      }

      const level = profile?.level || "N5";
      setUserLevel(level);

      // Fetch all groups for this level and category
      const { data: questionsData, error: questionsError } = await supabase
        .from("questions")
        .select("group")
        .eq("level", level)
        .eq("category", category);

      if (questionsError) {
        console.error("Error fetching groups:", questionsError);
        setLoading(false);
        return;
      }

      // Count questions per group
      const groupCounts: Record<string, number> = {};
      (questionsData || []).forEach((q) => {
        const groupName = q.group || "Ungrouped";
        groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
      });

      // Get user's answered questions for progress
      const { data: sessionsData } = await supabase
        .from("practice_sessions")
        .select("question_id, group_name")
        .eq("user_id", user.id)
        .eq("level", level)
        .eq("category", category);

      // Count unique answered questions per group
      const answeredCounts: Record<string, Set<string>> = {};
      (sessionsData || []).forEach((s) => {
        if (!answeredCounts[s.group_name]) {
          answeredCounts[s.group_name] = new Set();
        }
        answeredCounts[s.group_name].add(s.question_id);
      });

      // Build groups array
      const groupsArray: GroupData[] = Object.entries(groupCounts).map(([groupName, total]) => ({
        group: groupName,
        total,
        answered: answeredCounts[groupName]?.size || 0
      })).sort((a, b) => a.group.localeCompare(b.group));

      setGroups(groupsArray);
      setLoading(false);
    };

    loadGroups();
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
          <div className="space-y-4">
            {groups.map((group, index) => {
              const progress = group.total > 0 ? (group.answered / group.total) * 100 : 0;
              
              return (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{group.group}</h3>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-muted-foreground">
                          {group.total} questions
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {group.answered} / {group.total} answered
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <Link href={`/practice/${category}/${encodeURIComponent(group.group)}`}>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Start
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}