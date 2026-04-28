import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SEO } from "@/components/SEO";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Check, X, RefreshCw, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getReviewQuestions,
  updateReviewItem,
  saveQuestionResult,
  type Question,
} from "@/services/questionService";
import { useLevel } from "@/contexts/LevelContext";

const LEVEL_COLORS: { [key: string]: string } = {
  N5: "#22c55e",
  N4: "#14b8a6",
  N3: "#8b5cf6",
  N2: "#f59e0b",
  N1: "#991b1b",
};

export default function Review() {
  const router = useRouter();
  const { level } = useLevel();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndReviewQuestions();

    // Listen for level changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedLevel") {
        loadUserAndReviewQuestions();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  async function loadUserAndReviewQuestions() {
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.push("/auth/login");
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single();

    setUser(userData);

    // Get selected level from localStorage (set by header)
    const selectedLevel = localStorage.getItem("selectedLevel") || "N5";

    // Fetch review items for the user at their selected level
    const { data: reviewData, error: reviewError } = await supabase
      .from("practice_sessions")
      .select("question_id")
      .eq("user_id", authUser.id)
      .eq("level", selectedLevel)
      .eq("is_correct", false)
      .order("answered_at", { ascending: false })
      .limit(50);

    if (reviewError) {
      console.error("Error fetching review data:", reviewError);
      setLoading(false);
      return;
    }

    if (!reviewData || reviewData.length === 0) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    // Get unique question IDs
    const questionIds = Array.from(new Set(reviewData.map(r => r.question_id)));

    // Fetch the actual questions
    const { data: questionsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .in("id", questionIds)
      .eq("level", selectedLevel)
      .limit(20);

    if (questionsError) {
      console.error("Error fetching questions:", questionsError);
      setLoading(false);
      return;
    }

    setQuestions(questionsData || []);
    setLoading(false);
  }

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  async function handleAnswer(answerIndex: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const isCorrect = answerIndex === currentQuestion.answer_index;

    if (isCorrect) {
      setCorrectCount(correctCount + 1);
    }

    // Save result
    if (user) {
      await saveQuestionResult(user.id, currentQuestion.id, isCorrect, "review");
      await updateReviewItem(user.id, currentQuestion.id, isCorrect);
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      router.push(`/progress?score=${correctCount}&total=${questions.length}&mode=review`);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <SEO title="Review - Master JLPT" />
        <BackButton />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading review questions...</p>
        </div>
      </AppLayout>
    );
  }

  if (!questions.length) {
    return (
      <AppLayout>
        <SEO title="Review - Master JLPT" />
        <BackButton />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-bold">No items to review</h2>
              <p className="text-muted-foreground">
                You haven't added any questions to review yet. Questions you answer incorrectly will appear here.
              </p>
              <Button onClick={() => router.push("/practice")}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Practicing
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const levelColor = LEVEL_COLORS[currentQuestion.level] || "#22c55e";
  const options = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : [];

  return (
    <AppLayout>
      <SEO title="Review - Master JLPT" />
      <BackButton />
      
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Badge style={{ backgroundColor: levelColor }} className="text-white">
                {currentQuestion.level}
              </Badge>
              <span className="text-muted-foreground capitalize">
                {currentQuestion.category}
              </span>
              <Badge variant="outline" className="border-orange-500 text-orange-700">
                Review
              </Badge>
            </div>
            <span className="text-sm font-medium">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-8 space-y-6">
            <h2 className="text-2xl font-bold leading-relaxed">
              {currentQuestion.question}
            </h2>

            {currentQuestion.example_sentence && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Example:</p>
                <p className="font-medium">{currentQuestion.example_sentence}</p>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3">
              {options.map((option: string, index: number) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.answer_index;
                const showCorrect = showExplanation && isCorrect;
                const showWrong = showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      showCorrect
                        ? "border-green-500 bg-green-50"
                        : showWrong
                        ? "border-red-500 bg-red-50"
                        : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${selectedAnswer !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <Check className="h-5 w-5 text-green-600" />}
                      {showWrong && <X className="h-5 w-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Explanation:
                </p>
                <p className="text-sm text-blue-800 leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* Next Button */}
            {showExplanation && (
              <Button onClick={handleNext} className="w-full" size="lg">
                {currentIndex < questions.length - 1 ? (
                  <>
                    Next Question <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  "View Results"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Score Tracker */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Score: <span className="font-bold text-foreground">{correctCount}</span> /{" "}
            {currentIndex + (selectedAnswer !== null ? 1 : 0)}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}