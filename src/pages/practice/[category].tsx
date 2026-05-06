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
import { useLevel } from "@/contexts/LevelContext";
import { Lock } from "lucide-react";

interface GroupData {
  group: string;
  total: number;
  answered: number;
}

const categoryInfo: Record<string, { icon: string; title: string }> = {
  kanji: { icon: "漢字", title: "Kanji" },
  grammar: { icon: "文法", title: "Grammar" },
  reading: { icon: "読解", title: "Reading" }
};

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const { level } = useLevel();

  const [groups, setGroups] = useState<GroupData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const FREE_DAILY_LIMIT = 3;
  const FREE_LEVEL = "N5";

  useEffect(() => {
    if (category && typeof category === "string") {
      loadGroups();
    }
  }, [category, level]);

  async function loadGroups() {
    if (!category || typeof category !== "string") return;
    setLoading(true);
    setGroups([]);

    const user = await authService.getCurrentUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUserId(user.id);

    // Get user profile for premium status
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium, level")
      .eq("id", user.id)
      .single();

    const premium = profile?.is_premium || false;
    setIsPremium(premium);

    // If free user trying to access non-N5 level — redirect
    if (!premium && level !== FREE_LEVEL) {
      setLoading(false);
      return;
    }

    // Get today's question count for free users
    if (!premium) {
      const today = new Date().toISOString().split("T")[0];
      const { data: todaySessions } = await supabase
        .from("practice_sessions")
        .select("id")
        .eq("user_id", user.id)
        .gte("answered_at", today + "T00:00:00.000Z")
        .lte("answered_at", today + "T23:59:59.999Z");

      setTodayCount(todaySessions?.length || 0);
    }

    // Fetch groups
    const { data: questionsData, error } = await supabase
      .from("questions")
      .select("group")
      .eq("level", level)
      .eq("category", category);

    if (error) {
      console.error("Error fetching questions:", error);
      setLoading(false);
      return;
    }

    const groupCounts: { [key: string]: number } = {};
    questionsData?.forEach((q: any) => {
      const groupName = q.group || "Ungrouped";
      groupCounts[groupName] = (groupCounts[groupName] || 0) + 1;
    });

    const groupsWithProgress = await Promise.all(
      Object.entries(groupCounts).map(async ([groupName, total]) => {
        const { data: progressData } = await supabase
          .from("practice_sessions")
          .select("question_id")
          .eq("user_id", user.id)
          .eq("level", level)
          .eq("category", category)
          .eq("group_name", groupName)
          .eq("is_correct", true);

        const uniqueAnswered = new Set(progressData?.map(p => p.question_id) || []);
        return { group: groupName, total, answered: uniqueAnswered.size };
      })
    );

    setGroups(groupsWithProgress.sort((a, b) => a.group.localeCompare(b.group)));
    setLoading(false);
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      </AppLayout>
    );
  }

  const categoryData = categoryInfo[category as string] || { icon: "📚", title: String(category) };

  // Free user trying to access paid level
  if (!isPremium && level !== FREE_LEVEL) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
          <h2 className="text-2xl font-bold mb-3">Premium Required</h2>
          <p className="text-muted-foreground mb-6">
            {level} practice questions are only available for premium members. Upgrade to access all levels N5 to N2.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <Button className="w-full bg-[#cc1f1f] hover:bg-[#b01b1b] text-white" size="lg">
                Upgrade to Premium
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="outline" className="w-full">Back to Practice</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Free users can access N5 with 3 questions per day.
          </p>
        </div>
      </AppLayout>
    );
  }

  // Free user hit daily limit
  if (!isPremium && todayCount >= FREE_DAILY_LIMIT) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏰</div>
          <h2 className="text-2xl font-bold mb-3">Daily Limit Reached</h2>
          <p className="text-muted-foreground mb-2">
            You have used your <strong>3 free questions</strong> for today.
          </p>
          <p className="text-muted-foreground mb-6">
            Come back tomorrow or upgrade to Premium for unlimited practice.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/pricing">
              <Button className="w-full bg-[#cc1f1f] hover:bg-[#b01b1b] text-white" size="lg">
                Upgrade for Unlimited Access
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Free limit resets every day at midnight.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO
        title={`${categoryData.title} Practice - Master JLPT`}
        description={`Practice ${categoryData.title} questions for JLPT ${level}`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">Practice</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryData.title}</span>
        </div>

        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{categoryData.icon}</span>
              <h1 className="text-3xl font-bold">{categoryData.title} Practice</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Choose a group to start practicing · Level: {level}
            </p>
          </div>

          {/* Free user daily limit banner */}
          {!isPremium && (
            <div style={{ background: '#fff8e6', border: '1px solid #f59e0b', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#92400e' }}>
              <strong>{FREE_DAILY_LIMIT - todayCount} free questions</strong> remaining today.{" "}
              <Link href="/pricing" style={{ color: '#cc1f1f', fontWeight: 600 }}>Upgrade for unlimited →</Link>
            </div>
          )}
        </div>

        {groups.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No groups available</h3>
            <p className="text-muted-foreground mb-4">
              There are no {categoryData.title.toLowerCase()} questions for {level} yet.
            </p>
            <Link href="/practice">
              <Button>Back to Practice</Button>
            </Link>
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
                          <span className="text-primary font-medium">{group.answered} answered</span>
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
