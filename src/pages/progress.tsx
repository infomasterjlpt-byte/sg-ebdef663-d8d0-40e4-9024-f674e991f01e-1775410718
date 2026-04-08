import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, TrendingUp, Calendar, Target } from "lucide-react";

const LEVEL_TOTALS: { [key: string]: number } = {
  N5: 997,
  N4: 1150,
  N3: 1450,
  N2: 1650,
  N1: 1850,
};

const LEVEL_NAMES: { [key: string]: string } = {
  N5: "Beginner",
  N4: "Elementary",
  N3: "Intermediate",
  N2: "Upper Intermediate",
  N1: "Advanced",
};

const LEVEL_COLORS: { [key: string]: string } = {
  N5: "bg-green-500",
  N4: "bg-cyan-500",
  N3: "bg-purple-500",
  N2: "bg-amber-500",
  N1: "bg-red-500",
};

type LevelProgress = {
  level: string;
  mastered: number;
  total: number;
  percentage: number;
};

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allLevelsProgress, setAllLevelsProgress] = useState<LevelProgress[]>([]);
  const [currentLevelStats, setCurrentLevelStats] = useState<any>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    await loadProgressData(user.id, profile.target_level);
  }

  async function loadProgressData(userId: string, targetLevel: string) {
    // Load progress for all levels
    const levels = ["N5", "N4", "N3", "N2", "N1"];
    const levelProgressData: LevelProgress[] = [];

    for (const level of levels) {
      const { data: mastered } = await supabase
        .from("review_items")
        .select("id, questions!inner(*)")
        .eq("user_id", userId)
        .eq("questions.level", level)
        .eq("status", "mastered");

      const masteredCount = mastered?.length || 0;
      const total = LEVEL_TOTALS[level];
      const percentage = Math.min(Math.round((masteredCount / total) * 100), 100);

      levelProgressData.push({
        level,
        mastered: masteredCount,
        total,
        percentage,
      });
    }

    setAllLevelsProgress(levelProgressData);

    // Load detailed stats for current level
    const { data: categoryResults } = await supabase
      .from("results")
      .select("*, questions(*)")
      .eq("user_id", userId);

    const levelResults = categoryResults?.filter((r: any) => r.questions?.level === targetLevel) || [];
    const categories = ["kanji", "grammar", "vocabulary", "reading"];
    const categoryStats: any = {};

    categories.forEach((cat) => {
      const catResults = levelResults.filter((r: any) => r.questions?.category === cat);
      const catCorrect = catResults.filter((r: any) => r.correct).length;
      categoryStats[cat] = {
        total: catResults.length,
        correct: catCorrect,
        accuracy: catResults.length > 0 ? Math.round((catCorrect / catResults.length) * 100) : 0,
      };
    });

    setCurrentLevelStats(categoryStats);

    // Load weekly progress
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: dailyData } = await supabase
      .from("daily_progress")
      .select("*")
      .eq("user_id", userId)
      .gte("date", weekAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    setWeeklyProgress(dailyData || []);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading progress...</p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Progress - Master JLPT" description="Track your JLPT study progress" />
      <AppLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Your Progress</h1>
            <p className="text-muted-foreground">Track your journey to JLPT mastery</p>
          </div>

          {/* All Levels Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                All Levels Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allLevelsProgress.map((levelData) => (
                <div key={levelData.level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`${LEVEL_COLORS[levelData.level]} text-white`}>
                        {levelData.level}
                      </Badge>
                      <span className="font-medium">{LEVEL_NAMES[levelData.level]}</span>
                      {levelData.level === userProfile?.target_level && (
                        <Badge variant="outline" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">{levelData.percentage}%</span>
                      <p className="text-xs text-muted-foreground">
                        {levelData.mastered}/{levelData.total} mastered
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={levelData.percentage} 
                    className={`h-2 ${levelData.percentage === 0 ? 'opacity-30' : ''}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Current Level Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  {userProfile?.target_level} Category Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentLevelStats && Object.entries(currentLevelStats).map(([category, stats]: [string, any]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <span className="text-sm text-muted-foreground">
                        {stats.correct}/{stats.total} ({stats.accuracy}%)
                      </span>
                    </div>
                    <Progress value={stats.accuracy} className="h-2" />
                  </div>
                ))}
                {(!currentLevelStats || Object.values(currentLevelStats).every((s: any) => s.total === 0)) && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Start practicing {userProfile?.target_level} to see category stats
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyProgress.length > 0 ? (
                  <div className="space-y-3">
                    {weeklyProgress.map((day) => (
                      <div key={day.date} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(day.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{day.questions_answered} questions</span>
                          {day.goal_met && <Trophy className="h-4 w-4 text-accent" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No activity this week. Start practicing!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Study Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userProfile?.streak || 0}</div>
                <p className="text-sm text-muted-foreground">days in a row</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currentLevelStats ? Object.values(currentLevelStats).reduce((sum: number, s: any) => sum + s.total, 0) : 0}
                </div>
                <p className="text-sm text-muted-foreground">{userProfile?.target_level} answered</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Overall Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currentLevelStats && Object.values(currentLevelStats).reduce((sum: number, s: any) => sum + s.total, 0) > 0
                    ? Math.round(
                        (Object.values(currentLevelStats).reduce((sum: number, s: any) => sum + s.correct, 0) /
                          Object.values(currentLevelStats).reduce((sum: number, s: any) => sum + s.total, 0)) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p className="text-sm text-muted-foreground">{userProfile?.target_level} questions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </>
  );
}