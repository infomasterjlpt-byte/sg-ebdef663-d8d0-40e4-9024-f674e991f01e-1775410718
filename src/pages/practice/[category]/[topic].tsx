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
import { Check, X } from "lucide-react";
import { useLevel } from "@/contexts/LevelContext";

interface Question {
  id: string;
  question: string;
  sentence: string | null;
  options: string[];
  answer_index: number;
  explanation: string | null;
  example_sentence: string | null; // underlined word
}

interface Profile {
  is_premium?: boolean;
}

const categoryInfo: Record<string, { icon: string; title: string }> = {
  kanji: { icon: "漢字", title: "Kanji" },
  grammar: { icon: "文法", title: "Grammar" },
  reading: { icon: "読解", title: "Reading" }
};

const FREE_DAILY_LIMIT = 3;

// Renders a sentence with the underlined word highlighted
function SentenceWithUnderline({ sentence, underlinedWord }: { sentence: string; underlinedWord: string }) {
  if (!underlinedWord || !sentence.includes(underlinedWord)) {
    return <p className="text-lg text-gray-800 leading-relaxed">{sentence}</p>;
  }

  const parts = sentence.split(underlinedWord);
  return (
    <p className="text-lg text-gray-800 leading-relaxed">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span style={{ borderBottom: "2.5px solid #cc1f1f", paddingBottom: "1px", fontWeight: 700, color: "#cc1f1f" }}>
              {underlinedWord}
            </span>
          )}
        </span>
      ))}
    </p>
  );
}

export default function TopicPage() {
  const router = useRouter();
  const { category, topic } = router.query;
  const { level } = useLevel();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (category && topic && typeof category === "string" && typeof topic === "string") {
      loadQuestions();
    }
  }, [category, topic, level]);

  async function loadQuestions() {
    if (!category || !topic || typeof category !== "string" || typeof topic !== "string") return;

    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setShowPaywall(false);

    const user = await authService.getCurrentUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUserId(user.id);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();

    const profile = profileData as Profile | null;
    const premium = profile?.is_premium === true;
    setIsPremium(premium);

    let todayAnswered = 0;
    if (!premium) {
      const today = new Date().toISOString().split("T")[0];
      const { data: todaySessions } = await supabase
        .from("practice_sessions")
        .select("id")
        .eq("user_id", user.id)
        .gte("answered_at", today + "T00:00:00.000Z")
        .lte("answered_at", today + "T23:59:59.999Z");

      todayAnswered = todaySessions?.length || 0;
      setTodayCount(todayAnswered);

      if (todayAnswered >= FREE_DAILY_LIMIT) {
        setShowPaywall(true);
        setLoading(false);
        return;
      }
    }

    const limit = premium ? 20 : FREE_DAILY_LIMIT - todayAnswered;

    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("level", level)
      .eq("category", category)
      .eq("group", decodeURIComponent(topic))
      .limit(limit);

    if (error) {
      setLoading(false);
      return;
    }

    const shuffled = (data || []).sort(() => Math.random() - 0.5);
    const formattedQuestions: Question[] = shuffled.map(q => ({
      id: q.id,
      question: q.question,
      sentence: q.sentence || null,
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      answer_index: q.answer_index,
      explanation: q.explanation,
      example_sentence: q.example_sentence // underlined word
    }));

    setQuestions(formattedQuestions);
    setAnsweredQuestions(new Array(formattedQuestions.length).fill(false));
    setCorrectAnswers(new Array(formattedQuestions.length).fill(false));
    setLoading(false);
  }

  const handleAnswerSelect = async (answerIndex: number) => {
    const currentQuestion = questions[currentIndex];
    if (answeredQuestions[currentIndex]) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.answer_index;

    const newAnswered = [...answeredQuestions];
    newAnswered[currentIndex] = true;
    setAnsweredQuestions(newAnswered);

    const newCorrect = [...correctAnswers];
    newCorrect[currentIndex] = correct;
    setCorrectAnswers(newCorrect);

    if (userId && topic) {
      await supabase.from("practice_sessions").insert({
        user_id: userId,
        level: level,
        category: category as string,
        group_name: decodeURIComponent(topic as string),
        question_id: currentQuestion.id,
        is_correct: correct,
        answered_at: new Date().toISOString()
      });
      setTodayCount(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!isPremium && todayCount >= FREE_DAILY_LIMIT) {
      setShowPaywall(true);
      return;
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        </div>
      </AppLayout>
    );
  }

  const topicName = topic ? decodeURIComponent(topic as string) : "";
  const categoryData = categoryInfo[category as string] || { icon: "📚", title: String(category) };

  if (showPaywall) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏰</div>
          <h2 className="text-2xl font-bold mb-3">Daily Limit Reached</h2>
          <p className="text-muted-foreground mb-2">
            You have used your <strong>3 free questions</strong> for today.
          </p>
          <p className="text-muted-foreground mb-6">
            Upgrade to Premium for unlimited practice questions every day.
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

  if (questions.length === 0) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No questions available</h3>
            <p className="text-muted-foreground mb-4">
              There are no questions for this group at {level} level yet.
            </p>
            <Link href={`/practice/${category}`}>
              <Button>Back to Groups</Button>
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasAnswered = answeredQuestions[currentIndex];
  const score = correctAnswers.filter(Boolean).length;
  const percentage = Math.round((score / questions.length) * 100);
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const optionLabels = ["A", "B", "C", "D"];

  if (showResults) {
    let emoji = "😢";
    if (percentage >= 80) emoji = "🎉";
    else if (percentage >= 50) emoji = "🙂";

    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
              <p className="text-muted-foreground mb-8">Great work completing this session</p>
              <div className="mb-8">
                <div className="text-6xl font-bold text-primary mb-2">{score}/{questions.length}</div>
                <div className="text-2xl text-muted-foreground mb-4">{percentage}% Correct</div>
                <div className="text-6xl mb-4">{emoji}</div>
              </div>
              {!isPremium && (
                <div style={{ background: '#fff8e6', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#92400e' }}>
                  You have used <strong>{todayCount} of {FREE_DAILY_LIMIT}</strong> free questions today.{" "}
                  <Link href="/pricing" style={{ color: '#cc1f1f', fontWeight: 600 }}>Upgrade for unlimited →</Link>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => loadQuestions()} className="bg-red-600 hover:bg-red-700 text-white" size="lg">
                  Practice Again
                </Button>
                <Link href={`/practice/${category}`}>
                  <Button variant="outline" size="lg">Back to Groups</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO
        title={`${topicName} - ${categoryData.title} Practice`}
        description={`Practice ${categoryData.title} questions`}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">Practice</Link>
          <span>/</span>
          <Link href={`/practice/${category}`} className="hover:text-foreground">{categoryData.title}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{topicName}</span>
        </div>

        {!isPremium && (
          <div style={{ background: '#fff8e6', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px 16px', marginBottom: '16px', fontSize: '13px', color: '#92400e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{FREE_DAILY_LIMIT - todayCount} free questions</strong> remaining today</span>
            <Link href="/pricing" style={{ color: '#cc1f1f', fontWeight: 600, fontSize: '12px' }}>Upgrade →</Link>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Question {currentIndex + 1} of {questions.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="p-8">

          {/* Reading: show passage */}
          {category === "reading" && currentQuestion.sentence && currentQuestion.sentence.trim() !== "" && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm font-medium text-gray-500 mb-2">Passage:</p>
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.sentence}</p>
            </div>
          )}

          {/* Kanji / Grammar: show sentence with underlined word */}
          {category !== "reading" && currentQuestion.sentence && currentQuestion.sentence.trim() !== "" && (
            <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
              <SentenceWithUnderline
                sentence={currentQuestion.sentence}
                underlinedWord={currentQuestion.example_sentence || ""}
              />
            </div>
          )}

          <h2 className="text-xl font-bold mb-6 text-gray-700">{currentQuestion.question}</h2>

          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectAnswer = index === currentQuestion.answer_index;
              const showCorrect = hasAnswered && isCorrectAnswer;
              const showIncorrect = hasAnswered && isSelected && !isCorrectAnswer;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrect ? "border-green-500 bg-green-50"
                    : showIncorrect ? "border-red-500 bg-red-50"
                    : isSelected ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"
                  } ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-muted-foreground">{optionLabels[index]}</span>
                      <span className={showCorrect ? "text-green-700 font-medium" : showIncorrect ? "text-red-700 font-medium" : ""}>
                        {option}
                      </span>
                    </div>
                    {showCorrect && <Check className="h-5 w-5 text-green-500" />}
                    {showIncorrect && <X className="h-5 w-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>

          {hasAnswered && currentQuestion.explanation && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
              <p className="text-sm font-medium text-blue-800 mb-1">Explanation</p>
              <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
            </div>
          )}

          {hasAnswered && (
            <Button onClick={handleNextQuestion} className="w-full bg-red-600 hover:bg-red-700 text-white" size="lg">
              {currentIndex < questions.length - 1 ? "Next Question →" : "See Results"}
            </Button>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
