import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, TrendingUp, BookOpen, Clock, Trophy, AlertCircle, ChevronRight } from "lucide-react";

type RecentResult = {
  id: string;
  created_at: string;
  correct: boolean;
  mode: string;
  questions: {
    question: string;
    category: string;
    level: string;
  };
};

type CategoryStats = {
  vocabulary: { correct: number; total: number; accuracy: number };
  grammar: { correct: number; total: number; accuracy: number };
  reading: { correct: number; total: number; accuracy: number };
  kanji: { correct: number; total: number; accuracy: number };
};

const LEVEL_TOTALS: { [key: string]: number } = {
  N5: 997,
  N4: 2350,
  N3: 5000,
  N2: 7750,
  N1: 12850,
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUser(user);

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);

    if (!profile?.target_level) {
      router.push("/level-selection");
      return;
    }

    await loadDashboardData(user.id, profile.target_level);
  }

  async function loadDashboardData(userId: string, targetLevel: string) {
    const today = new Date().toISOString().split("T")[0];
    
    const [progressRes, resultsRes, reviewRes, testsRes] = await Promise.all([
      supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single(),
      
      supabase
        .from("results")
        .select("*, questions(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      
      supabase
        .from("review_items")
        .select("*")
        .eq("user_id", userId)
        .neq("status", "mastered"),
      
      supabase
        .from("mock_tests")
        .select("time_taken")
        .eq("user_id", userId)
    ]);

    setTodayProgress(progressRes.data);
    setRecentResults((resultsRes.data || []) as RecentResult[]);
    setReviewCount(reviewRes.data?.length || 0);

    const totalTime = testsRes.data?.reduce((sum, test) => sum + (test.time_taken || 0), 0) || 0;
    setTotalStudyTime(totalTime);

    await calculateCategoryStats(userId, targetLevel);
    
    setLoading(false);
  }

  async function calculateCategoryStats(userId: string, level: string) {
    const { data: results } = await supabase
      .from("results")
      .select("*, questions(*)")
      .eq("user_id", userId);

    const levelResults = results?.filter((r: any) => r.questions?.level === level) || [];
    
    const stats: CategoryStats = {
      vocabulary: { correct: 0, total: 0, accuracy: 0 },
      grammar: { correct: 0, total: 0, accuracy: 0 },
      reading: { correct: 0, total: 0, accuracy: 0 },
      kanji: { correct: 0, total: 0, accuracy: 0 },
    };

    levelResults.forEach((r: any) => {
      const category = r.questions?.category;
      if (category && stats[category as keyof CategoryStats]) {
        stats[category as keyof CategoryStats].total++;
        if (r.correct) {
          stats[category as keyof CategoryStats].correct++;
        }
      }
    });

    Object.keys(stats).forEach((key) => {
      const cat = stats[key as keyof CategoryStats];
      cat.accuracy = cat.total > 0 ? Math.round((cat.correct / cat.total) * 100) : 0;
    });

    setCategoryStats(stats);
  }

  function getWeakestCategory(): { name: string; accuracy: number } | null {
    if (!categoryStats) return null;
    
    const categories = Object.entries(categoryStats)
      .filter(([_, stats]) => stats.total > 0)
      .sort((a, b) => a[1].accuracy - b[1].accuracy);
    
    if (categories.length === 0) return null;
    
    return {
      name: categories[0][0],
      accuracy: categories[0][1].accuracy,
    };
  }

  function getOverallProgress(): number {
    if (!categoryStats || !userProfile?.target_level) return 0;
    
    const { data: masteredItems } = await supabase
      .from("review_items")
      .select("*")
      .eq("user_id", user?.id)
      .eq("status", "mastered");
    
    const totalMastered = masteredItems?.length || 0;
    const levelTotal = LEVEL_TOTALS[userProfile.target_level] || 1000;
    
    return Math.min(Math.round((totalMastered / levelTotal) * 100), 100);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded mx-auto mb-4 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-3xl">J</span>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = todayProgress
    ? Math.min((todayProgress.questions_answered / (userProfile?.daily_goal || 20)) * 100, 100)
    : 0;

  const weakestTopic = getWeakestCategory();
  const overallProgress = 0;

  return (
    <>
      <SEO title="Dashboard - JLPT Master" description="Your personalized JLPT study dashboard" />
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back!</h1>
              <p className="text-muted-foreground">
                Target Level: <span className="text-primary font-semibold">{userProfile?.target_level}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  Study Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userProfile?.streak || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">consecutive days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Daily Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {todayProgress?.questions_answered || 0}/{userProfile?.daily_goal || 20}
                </div>
                <Progress value={progressPercentage} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallProgress}%</div>
                <p className="text-xs text-muted-foreground mt-1">of {userProfile?.target_level} mastered</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Recommended Practice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewCount > 0 && (
                  <div className="border border-border rounded-lg p-4 bg-surface">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">Review Items</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          You have {reviewCount} question{reviewCount !== 1 ? 's' : ''} to review
                        </p>
                        <Button onClick={() => router.push("/review")} className="w-full">
                          Start Review Session
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {weakestTopic && (
                  <div className="border border-border rounded-lg p-4 bg-surface">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">Focus Area</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="capitalize font-medium">{weakestTopic.name}</span> needs attention
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          Current accuracy: {weakestTopic.accuracy}%
                        </p>
                        <Button 
                          variant="outline"
                          onClick={() => router.push(`/practice?category=${weakestTopic.name}`)} 
                          className="w-full"
                        >
                          Practice {weakestTopic.name}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border border-border rounded-lg p-4 bg-surface">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">Quick Practice</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        10 questions to maintain your streak
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push("/practice?category=vocabulary")}
                        >
                          Vocabulary
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push("/practice?category=grammar")}
                        >
                          Grammar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activity. Start practicing to see your progress!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface hover:bg-surface/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${result.correct ? 'bg-green-600' : 'bg-destructive'}`} />
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {result.questions?.question || 'Question'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.questions?.category} • {result.mode}
                            </p>
                          </div>
                        </div>
                        <Badge variant={result.correct ? "default" : "destructive"} className="text-xs">
                          {result.correct ? 'Correct' : 'Wrong'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {!categoryStats ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Start practicing to see your performance by category
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(categoryStats).map(([category, stats]) => (
                    <div key={category} className="border border-border rounded-lg p-4 bg-surface">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold capitalize">{category}</h3>
                        <Badge variant="outline">{stats.accuracy}%</Badge>
                      </div>
                      <Progress value={stats.accuracy} className="h-2 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {stats.correct} / {stats.total} correct
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/practice?category=${category}`)}
                        className="w-full mt-3 text-primary hover:text-primary"
                      >
                        Practice <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Study Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Study Time</span>
                  <span className="font-semibold">
                    {Math.floor(totalStudyTime / 60)} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Questions Answered</span>
                  <span className="font-semibold">{recentResults.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Items to Review</span>
                  <span className="font-semibold">{reviewCount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => router.push("/practice")} className="w-full justify-between">
                  Start Practice Session
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button onClick={() => router.push("/mock-test")} variant="outline" className="w-full justify-between">
                  Take Mock Test
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button onClick={() => router.push("/progress")} variant="outline" className="w-full justify-between">
                  View Detailed Progress
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </>
  );
}