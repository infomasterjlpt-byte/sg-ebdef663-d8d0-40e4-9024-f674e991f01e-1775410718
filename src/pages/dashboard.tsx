import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { LevelChangeModal } from "@/components/LevelChangeModal";
import { BookOpen, Target, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

const JLPT_SYLLABUS: { [key: string]: {
  color: string;
  label: string;
  goal: string;
  kanji: { total: number; description: string };
  grammar: { total: number; description: string };
  reading: { total: number; description: string };
}} = {
  N5: {
    color: "#22c55e",
    label: "Beginner",
    goal: "Understand very simple daily Japanese",
    kanji: { total: 300, description: "~100 basic kanji (numbers, time, nature, people)" },
    grammar: { total: 300, description: "Basic patterns (です, ます, particles は, を, に)" },
    reading: { total: 300, description: "Simple sentences and short everyday texts" },
  },
  N4: {
    color: "#14b8a6",
    label: "Elementary",
    goal: "Handle basic real-life situations in Japanese",
    kanji: { total: 300, description: "~300 kanji (daily life, work, school, travel)" },
    grammar: { total: 300, description: "て-form, casual speech, conditionals" },
    reading: { total: 300, description: "Short passages on daily topics" },
  },
  N3: {
    color: "#8b5cf6",
    label: "Lower Intermediate",
    goal: "Understand daily Japanese fairly well",
    kanji: { total: 300, description: "~600 kanji (intermediate topics)" },
    grammar: { total: 300, description: "Intermediate grammar (〜わけ, 〜ように, etc.)" },
    reading: { total: 300, description: "Everyday topics and simple articles" },
  },
  N2: {
    color: "#f59e0b",
    label: "Upper Intermediate",
    goal: "Work and study in Japanese environments",
    kanji: { total: 300, description: "~1000+ kanji (advanced usage)" },
    grammar: { total: 300, description: "Advanced everyday grammar patterns" },
    reading: { total: 300, description: "Newspapers, essays, opinions" },
  },
  N1: {
    color: "#991b1b",
    label: "Advanced",
    goal: "Near-native comprehension",
    kanji: { total: 300, description: "~2000+ kanji (complex usage)" },
    grammar: { total: 300, description: "Complex and nuanced expressions" },
    reading: { total: 300, description: "Abstract texts, editorials, critiques" },
  },
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [progress, setProgress] = useState<{ [key: string]: { answered: number; correct: number } }>({});
  const [loading, setLoading] = useState(true);
  const [showLevelModal, setShowLevelModal] = useState(false);

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
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    if (profile?.level) {
      await loadProgress(user.id, profile.level);
    }
    setLoading(false);
  }

  async function loadProgress(userId: string, level: string) {
    const { data } = await supabase
      .from("practice_sessions")
      .select("category, is_correct, question_id")
      .eq("user_id", userId)
      .eq("level", level);

    const stats: { [key: string]: { answered: number; correct: number } } = {
      kanji: { answered: 0, correct: 0 },
      grammar: { answered: 0, correct: 0 },
      reading: { answered: 0, correct: 0 },
    };

    const seen: { [key: string]: Set<string> } = {
      kanji: new Set(),
      grammar: new Set(),
      reading: new Set(),
    };

    data?.forEach((session: any) => {
      const cat = session.category;
      if (stats[cat] !== undefined) {
        seen[cat].add(session.question_id);
        if (session.is_correct) stats[cat].correct++;
      }
    });

    Object.keys(stats).forEach(cat => {
      stats[cat].answered = seen[cat].size;
    });

    setProgress(stats);
  }

  const handleLevelChanged = async () => {
    setLoading(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserProfile(profile);
    setProgress({
      kanji: { answered: 0, correct: 0 },
      grammar: { answered: 0, correct: 0 },
      reading: { answered: 0, correct: 0 }
    });
    if (profile?.level) await loadProgress(user.id, profile.level);
    setLoading(false);
    setShowLevelModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  const level = userProfile?.level || "N5";
  const syllabus = JLPT_SYLLABUS[level];
  const levelColor = syllabus?.color || "#cc1f1f";

  const totalQuestions = syllabus.kanji.total + syllabus.grammar.total + syllabus.reading.total;
  const totalAnswered = (progress.kanji?.answered || 0) + (progress.grammar?.answered || 0) + (progress.reading?.answered || 0);
  const overallPercent = Math.min(Math.round((totalAnswered / totalQuestions) * 100), 100);

  const categories = [
    { key: "kanji",   icon: "漢字", label: "Kanji",   description: syllabus.kanji.description,   total: syllabus.kanji.total },
    { key: "grammar", icon: "文法", label: "Grammar", description: syllabus.grammar.description, total: syllabus.grammar.total },
    { key: "reading", icon: "読解", label: "Reading", description: syllabus.reading.description, total: syllabus.reading.total },
  ];

  return (
    <>
      <SEO title="Dashboard - Master JLPT" description="Your JLPT study progress" />
      <AppLayout>
        <div className="space-y-6 max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">My Progress</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-muted-foreground text-sm">Current Level:</span>
                <Badge style={{ background: levelColor, color: 'white', border: 'none', fontSize: '14px', padding: '4px 12px' }}>
                  {level} — {syllabus.label}
                </Badge>
                <button
                  onClick={() => setShowLevelModal(true)}
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff',
                    background: '#cc1f1f',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  ✎ Change Level
                </button>
              </div>
              <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
                🎯 Goal: {syllabus.goal}
              </p>
            </div>
            <Button asChild style={{ background: '#cc1f1f', color: 'white' }}>
              <Link href="/practice">Continue Practicing →</Link>
            </Button>
          </div>

          {/* Disclaimer */}
          <div style={{ background: '#fff8e6', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <AlertCircle size={16} color="#d97706" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
              <strong>Important:</strong> Progress is tracked per level. If you switch to a different level your progress for the current level will not be saved. We recommend completing your current level before switching.
            </p>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp size={20} color="#cc1f1f" />
                Overall {level} Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '52px', fontWeight: 800, color: levelColor, lineHeight: 1 }}>
                  {overallPercent}%
                </span>
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ color: '#555', fontSize: '15px', margin: 0 }}>
                    {totalAnswered} unique questions practiced
                  </p>
                  <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
                    out of {totalQuestions} available questions
                  </p>
                </div>
              </div>
              <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '99px', height: '14px' }}>
                <div style={{
                  width: `${overallPercent}%`,
                  background: `linear-gradient(90deg, ${levelColor}, ${levelColor}cc)`,
                  borderRadius: '99px',
                  height: '14px',
                  transition: 'width 0.6s ease'
                }} />
              </div>
              <p style={{ color: '#aaa', fontSize: '12px', marginTop: '8px' }}>
                {totalQuestions - totalAnswered} questions remaining in {level} syllabus
              </p>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={20} color="#cc1f1f" />
                {level} Syllabus Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {categories.map(({ key, icon, label, description, total }) => {
                const answered = progress[key]?.answered || 0;
                const correct = progress[key]?.correct || 0;
                const percent = Math.min(Math.round((answered / total) * 100), 100);
                const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '22px' }}>{icon}</span>
                          <span style={{ fontWeight: 700, fontSize: '16px' }}>{label}</span>
                          <span style={{ background: levelColor + '22', color: levelColor, fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
                            {percent}% done
                          </span>
                        </div>
                        <p style={{ color: '#888', fontSize: '12px', margin: '4px 0 0 30px' }}>{description}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#333', margin: 0 }}>
                          {answered} <span style={{ color: '#aaa', fontWeight: 400 }}>/ {total} practiced</span>
                        </p>
                        {answered > 0 && (
                          <p style={{ fontSize: '12px', color: '#22c55e', margin: 0 }}>✓ {accuracy}% accuracy</p>
                        )}
                        {answered === 0 && (
                          <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>Not started yet</p>
                        )}
                      </div>
                    </div>

                    <div style={{ width: '100%', background: '#f0f0f0', borderRadius: '99px', height: '10px' }}>
                      <div style={{
                        width: `${percent}%`,
                        background: levelColor,
                        borderRadius: '99px',
                        height: '10px',
                        transition: 'width 0.6s ease',
                        minWidth: percent > 0 ? '12px' : '0'
                      }} />
                    </div>

                    <div style={{ marginTop: '6px', textAlign: 'right' }}>
                      <Link href={`/practice/${key}`} style={{ fontSize: '12px', color: '#cc1f1f', textDecoration: 'none', fontWeight: 500 }}>
                        Practice {label} →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target size={20} color="#cc1f1f" />
                Start Practicing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {categories.map(({ key, icon, label }) => {
                  const answered = progress[key]?.answered || 0;
                  const total = syllabus[key as keyof typeof syllabus] as any;
                  const percent = Math.min(Math.round((answered / total.total) * 100), 100);
                  return (
                    <Link key={key} href={`/practice/${key}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: '#fff5f5',
                        border: `1px solid ${levelColor}44`,
                        borderRadius: '12px',
                        padding: '20px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s'
                      }}>
                        <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#cc1f1f', marginBottom: '4px' }}>{label}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{percent}% complete</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>
      </AppLayout>

      {user && userProfile && (
        <LevelChangeModal
          open={showLevelModal}
          onOpenChange={setShowLevelModal}
          currentLevel={userProfile.level || "N5"}
          userId={user.id}
          onLevelChanged={handleLevelChanged}
        />
      )}
    </>
  );
}
