import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, ChevronRight, BookOpen } from "lucide-react";

type ReviewQuestion = {
  id: string;
  level: string;
  type: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  example_sentence?: string;
  status: string;
  correct_streak: number;
};

const STATUS_COLORS = {
  learning: "bg-yellow-500",
  hard: "bg-red-500",
  mastered: "bg-green-600",
};

export default function Review() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);

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
    loadReviewQuestions(user.id);
  }

  async function loadReviewQuestions(userId: string) {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("review_items")
      .select(`
        id,
        status,
        correct_streak,
        question_id,
        questions (
          id,
          level,
          type,
          question,
          options,
          answer,
          explanation,
          example_sentence
        )
      `)
      .eq("user_id", userId)
      .neq("status", "mastered")
      .order("last_reviewed_at", { ascending: true })
      .limit(20);

    if (data) {
      const formatted = data.map(item => ({
        ...item.questions,
        status: item.status,
        correct_streak: item.correct_streak,
      })) as ReviewQuestion[];
      setQuestions(formatted);
    }
    
    setLoading(false);
  }

  async function handleAnswer(answerIndex: number) {
    if (showResult || !user) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = questions[currentIndex];
    const isCorrect = answerIndex === question.answer;

    await supabase
      .from("results")
      .insert({
        user_id: user.id,
        question_id: question.id,
        correct: isCorrect,
        mode: "review",
      });

    const newStreak = isCorrect ? question.correct_streak + 1 : 0;
    let newStatus = "learning";
    
    if (newStreak === 1) newStatus = "hard";
    if (newStreak >= 2) newStatus = "mastered";

    await supabase
      .from("review_items")
      .update({
        correct_streak: newStreak,
        status: newStatus,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("question_id", question.id);
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      loadReviewQuestions(user.id);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }

  const question = questions[currentIndex];
  const isCorrect = showResult && selectedAnswer === question?.answer;

  if (loading) {
    return (
      <>
        <SEO title="Review - JLPT Master" description="Review weak questions" />
        <AppLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Loading review questions...</p>
          </div>
        </AppLayout>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <SEO title="Review - JLPT Master" description="Review weak questions" />
        <AppLayout>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Questions to Review</h2>
                <p className="text-muted-foreground text-center mb-6">
                  You haven't answered any questions incorrectly yet.<br />
                  Start practicing to build your review queue.
                </p>
                <Button onClick={() => router.push("/practice")}>
                  Go to Practice
                </Button>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <SEO title="Review - JLPT Master" description="Review weak questions" />
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Review Mode</h1>
            <p className="text-muted-foreground">
              Review questions you got wrong to master them
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-accent h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-level-n3 text-white">
                    {question.level} - Question {currentIndex + 1}/{questions.length}
                  </Badge>
                  <Badge className={`${STATUS_COLORS[question.status as keyof typeof STATUS_COLORS]} text-white`}>
                    {question.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg font-medium">{question.question}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = index === question.answer;
                    const showCorrect = showResult && isCorrectOption;
                    const showWrong = showResult && isSelected && !isCorrect;

                    return (
                      <Button
                        key={index}
                        variant={showCorrect ? "default" : showWrong ? "destructive" : isSelected ? "secondary" : "outline"}
                        className={`h-auto py-4 justify-start text-left ${
                          showCorrect ? "bg-green-600 hover:bg-green-700" : ""
                        }`}
                        onClick={() => handleAnswer(index)}
                        disabled={showResult}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                            {showCorrect && <Check className="h-4 w-4" />}
                            {showWrong && <X className="h-4 w-4" />}
                            {!showResult && String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {showResult && (
                  <div className="border-l-4 border-accent bg-surface p-4 rounded space-y-2">
                    <div className="font-semibold flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-green-600">
                            {question.correct_streak + 1 >= 2 ? "Mastered!" : "Correct!"}
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="h-5 w-5 text-destructive" />
                          <span className="text-destructive">Incorrect - Review Again</span>
                        </>
                      )}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Correct Answer: </span>
                      {question.options[question.answer]}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Explanation: </span>
                      {question.explanation}
                    </div>
                    {question.example_sentence && (
                      <div className="text-sm">
                        <span className="font-medium">Example: </span>
                        {question.example_sentence}
                      </div>
                    )}
                  </div>
                )}

                {showResult && (
                  <Button onClick={handleNext} className="w-full">
                    {currentIndex < questions.length - 1 ? (
                      <>
                        Next Question <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Load More Questions"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </>
  );
}