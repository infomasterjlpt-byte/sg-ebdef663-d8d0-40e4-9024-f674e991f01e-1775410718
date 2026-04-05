import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, TrendingUp } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [todayProgress, setTodayProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth");
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

    const today = new Date().toISOString().split("T")[0];
    const { data: progress } = await supabase
      .from("daily_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single();

    setTodayProgress(progress);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded mx-auto mb-4 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-3xl">J</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = todayProgress
    ? Math.min((todayProgress.questions_answered / (userProfile?.daily_goal || 20)) * 100, 100)
    : 0;

  return (
    <>
      <SEO title="Home - JLPT Master" description="Master your JLPT exam preparation" />
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
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={todayProgress?.goal_met ? "default" : "secondary"}>
                  {todayProgress?.goal_met ? "Goal Met!" : "Keep Going"}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {todayProgress?.goal_met ? "Great work today!" : "You can do it!"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Practice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Jump into a quick 10-question practice session to maintain your streak.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  className="w-full"
                  onClick={() => router.push("/practice?category=vocabulary")}
                >
                  Vocabulary
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/practice?category=kanji")}
                >
                  Kanji
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/practice?category=grammar")}
                >
                  Grammar
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/practice?category=reading")}
                >
                  Reading
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}