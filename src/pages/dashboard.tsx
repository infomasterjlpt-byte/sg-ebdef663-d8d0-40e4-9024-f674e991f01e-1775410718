import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { LevelChangeModal } from "@/components/LevelChangeModal";
import { Flame, Target, Clock, TrendingUp, BookOpen, Award, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

const LEVEL_TOTALS: { [key: string]: number } = {
  N5: 997,
  N4: 1150,
  N3: 1450,
  N2: 1650,
  N1: 1850,
};

const LEVEL_COLORS: { [key: string]: string } = {
  N5: "bg-green-500",
  N4: "bg-cyan-500",
  N3: "bg-purple-500",
  N2: "bg-amber-500",
  N1: "bg-red-500",
};

const CATEGORY_LABELS: { [key: string]: string } = {
  vocabulary: "Vocabulary",
  grammar: "Grammar",
  reading: "Reading",
  kanji: "Kanji",
};

type RecentResult = {
  id: string;
  answered_at: string;
  correct: boolean;
  mode: string;
  questions: {
    question: string;
    category: string;
    level: string;
  };
};

type CategoryStats = {
  [key: string]: {
    total: number;
    correct: number;
    accuracy: number;
  };
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLevelModal, setShowLevelModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }
    setUser(user);

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile?.target_level) {
      router.push("/level-selection");
      return;
    }

    setUserProfile(profile);
    await loadDashboardData(user.id, profile.target_level);
  }

  async function loadDashboardData(userId: string, targetLevel: string) {
    const today = new Date().toISOString().split("T")[0];
    
    const [progressRes, resultsRes, reviewRes, testsRes, masteredRes] = await Promise.all([
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
        .order("answered_at", { ascending: false })
        .limit(10),
      
      supabase
        .from("review_items")
        .select("*, questions!inner(*)")
        .eq("user_id", userId)
        .eq("questions.level", targetLevel)
        .neq("status", "mastered"),
      
      supabase
        .from("mock_tests")
        .select("time_taken")
        .eq("user_id", userId)
        .eq("level", targetLevel),

      supabase
        .from("review_items")
        .select("id, questions!inner(*)")
        .eq("user_id", userId)
        .eq("questions.level", targetLevel)
        .eq("status", "mastered")
    ]);

    setTodayProgress(progressRes.data);
    setRecentResults((resultsRes.data || []).filter((r: any) => r.questions?.level === targetLevel) as unknown as RecentResult[]);
    setReviewCount(reviewRes.data?.length || 0);

    const totalTime = testsRes.data?.reduce((sum, test) => sum + (test.time_taken || 0), 0) || 0;
    setTotalStudyTime(totalTime);

    const totalMastered = masteredRes.data?.length || 0;
    const levelTotal = LEVEL_TOTALS[targetLevel] || 1000;
    setOverallProgress(Math.min(Math.round((totalMastered / levelTotal) * 100), 100));

    await calculateCategoryStats(userId, targetLevel);
    
    setLoading(false);
  }

  async function calculateCategoryStats(userId: string, targetLevel: string) {
    const { data: results } = await supabase
      .from("results")
      .select("*, questions(*)")
      .eq("user_id", userId);

    const levelResults = results?.filter((r: any) => r.questions?.level === targetLevel) || [];
    const categories = ["kanji", "grammar", "vocabulary", "reading"];
    const stats: CategoryStats = {};

    categories.forEach((cat) => {
      const catResults = levelResults.filter((r: any) => r.questions?.category === cat);
      const catCorrect = catResults.filter((r: any) => r.correct).length;
      stats[cat] = {
        total: catResults.length,
        correct: catCorrect,
        accuracy: catResults.length > 0 ? Math.round((catCorrect / catResults.length) * 100) : 0,
      };
    });

    setCategoryStats(stats);
  }

  function formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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

  const handleLevelChanged = () => {
    router.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const progressPercentage = todayProgress
    ? Math.min((todayProgress.questions_answered / (userProfile?.daily_goal || 20)) * 100, 100)
    : 0;

  const weakestTopic = getWeakestCategory();

  return (
    <>
      <SEO title="Dashboard - Master JLPT" description="Your personalized JLPT study dashboard" />
      <AppLayout>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Target Level:</span>
                <Badge variant="outline" className={`${LEVEL_COLORS[userProfile?.target_level]} text-white border-0`}>
                  {userProfile?.target_level}
                </Badge>
                <button 
                  onClick={() => setShowLevelModal(true)}
                  className="text-sm text-gray-500 hover:text-[#cc1f1f] underline"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards - All 4 visible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
                <Flame className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfile?.streak || 0} days</div>
                <p className="text-xs text-muted-foreground mt-1">Keep it going!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overallProgress}%</div>
                <p className="text-xs text-muted-foreground mt-1">{userProfile?.target_level} mastery</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(totalStudyTime)}</div>
                <p className="text-xs text-muted-foreground mt-1">Total practice time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Review Queue</CardTitle>
                <BookOpen className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Items to review</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Goal & Recommended Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Today's Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">
                      {todayProgress?.questions_answered || 0} / {userProfile?.daily_goal || 20} questions
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-surface rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                {todayProgress?.goal_met ? (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Goal completed! 🎉</span>
                  </div>
                ) : (
                  <Button asChild className="w-full">
                    <Link href="/practice">Continue Practice</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviewCount > 0 && (
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="/review">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-accent" />
                        Review {reviewCount} weak items
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {weakestTopic && (
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href="/practice">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        Practice {CATEGORY_LABELS[weakestTopic.name]} ({weakestTopic.accuracy}%)
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link href="/mock-test">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      Take Mock Test
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Category Performance & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance ({userProfile?.target_level})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryStats && Object.entries(categoryStats).map(([category, stats]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{CATEGORY_LABELS[category]}</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.correct}/{stats.total} ({stats.accuracy}%)
                      </span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(!categoryStats || Object.values(categoryStats).every(s => s.total === 0)) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No practice data yet. Start practicing to see your stats!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentResults.length > 0 ? (
                  recentResults.slice(0, 5).map((result) => (
                    <div key={result.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        {result.correct ? (
                          <div className="w-2 h-2 rounded-full bg-green-600" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-destructive" />
                        )}
                        <span className="truncate max-w-[200px]">
                          {result.questions?.question}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.questions?.category}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity yet. Start practicing!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>

      {user && userProfile && (
        <LevelChangeModal
          open={showLevelModal}
          onOpenChange={setShowLevelModal}
          currentLevel={userProfile.target_level || "N5"}
          userId={user.id}
          onLevelChanged={handleLevelChanged}
        />
      )}
    </>
  );
}