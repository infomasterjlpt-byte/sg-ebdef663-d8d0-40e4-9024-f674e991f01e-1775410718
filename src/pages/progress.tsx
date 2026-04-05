import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { getProgressStats } from "@/services/progressService";
import { BookOpen, FileText, Languages, BookMarked } from "lucide-react";

const LEVEL_SYLLABUS = {
  N5: { kanji: 100, vocabulary: 800, grammar: 285, reading: 212, total: 1397 },
  N4: { kanji: 300, vocabulary: 1500, grammar: 300, reading: 250, total: 2350 },
  N3: { kanji: 650, vocabulary: 3700, grammar: 350, reading: 300, total: 5000 },
  N2: { kanji: 1000, vocabulary: 6000, grammar: 400, reading: 350, total: 7750 },
  N1: { kanji: 2000, vocabulary: 10000, grammar: 450, reading: 400, total: 12850 },
};

const CATEGORY_CONFIG = {
  kanji: { 
    label: "Kanji (漢)", 
    icon: BookOpen, 
    color: "bg-accent", 
    textColor: "text-accent",
    lightBg: "bg-red-50 dark:bg-red-950/20"
  },
  grammar: { 
    label: "Grammar (文)", 
    icon: FileText, 
    color: "bg-level-n4", 
    textColor: "text-level-n4",
    lightBg: "bg-teal-50 dark:bg-teal-950/20"
  },
  vocabulary: { 
    label: "Vocabulary (語)", 
    icon: Languages, 
    color: "bg-level-n2", 
    textColor: "text-level-n2",
    lightBg: "bg-yellow-50 dark:bg-yellow-950/20"
  },
  reading: { 
    label: "Reading (読)", 
    icon: BookMarked, 
    color: "bg-blue-600", 
    textColor: "text-blue-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/20"
  },
};

export default function Progress() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
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
    
    if (profile?.target_level) {
      const progressData = await getProgressStats(user.id, profile.target_level);
      setStats(progressData);
    }
    
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <SEO title="Progress - JLPT Master" description="Track your learning progress" />
        <AppLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Loading progress data...</p>
          </div>
        </AppLayout>
      </>
    );
  }

  if (!userProfile?.target_level) {
    return (
      <>
        <SEO title="Progress - JLPT Master" description="Track your learning progress" />
        <AppLayout>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <h2 className="text-2xl font-bold mb-2">Set Your Target Level</h2>
                <p className="text-muted-foreground text-center mb-6">
                  Choose your target JLPT level to track your progress
                </p>
                <button onClick={() => router.push("/level-selection")} className="text-accent hover:underline">
                  Select Level →
                </button>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </>
    );
  }

  const syllabus = LEVEL_SYLLABUS[userProfile.target_level as keyof typeof LEVEL_SYLLABUS];
  const overallProgress = stats ? Math.round((stats.mastered / syllabus.total) * 100) : 0;

  return (
    <>
      <SEO title="Progress - JLPT Master" description="Track your JLPT learning progress" />
      <AppLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
            <p className="text-muted-foreground">
              Tracking {userProfile.target_level} level mastery
            </p>
          </div>

          <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">Overall Progress</h2>
                  <p className="text-muted-foreground">{userProfile.target_level} Level</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-accent">{overallProgress}%</p>
                  <p className="text-sm text-muted-foreground">
                    {stats?.mastered || 0} / {syllabus.total} mastered
                  </p>
                </div>
              </div>
              <div className="bg-surface h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(CATEGORY_CONFIG) as Array<keyof typeof CATEGORY_CONFIG>).map((category) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              const categoryStats = stats?.categoryStats?.[category] || { mastered: 0, hard: 0, learning: 0 };
              const categoryTotal = syllabus[category as keyof typeof syllabus] as number;
              const attempted = categoryStats.mastered + categoryStats.hard + categoryStats.learning;
              const progress = categoryTotal > 0 ? Math.round((categoryStats.mastered / categoryTotal) * 100) : 0;

              return (
                <Card key={category} className={config.lightBg}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-lg">{config.label}</CardTitle>
                      </div>
                      <span className={`text-2xl font-bold ${config.textColor}`}>{progress}%</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className={`h-2 rounded-full overflow-hidden ${config.color}/20`}>
                      <div
                        className={`h-full ${config.color} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <Badge className="bg-green-600 text-white w-full">
                          {categoryStats.mastered}
                        </Badge>
                        <p className="text-muted-foreground mt-1">Mastered</p>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-level-n2 text-white w-full">
                          {categoryStats.learning}
                        </Badge>
                        <p className="text-muted-foreground mt-1">Learning</p>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-destructive text-white w-full">
                          {categoryStats.hard}
                        </Badge>
                        <p className="text-muted-foreground mt-1">Hard</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {attempted} / {categoryTotal} attempted
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Study Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{stats?.accuracy || 0}%</p>
                  <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{stats?.totalQuestions || 0}</p>
                  <p className="text-sm text-muted-foreground">Questions Answered</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{userProfile.streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{stats?.mastered || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Mastered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}