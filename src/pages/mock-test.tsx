import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SEO } from "@/components/SEO";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ChevronRight, Check, X, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getMockTestQuestions,
  saveQuestionResult,
  saveMockTestResult,
  type Question,
} from "@/services/questionService";

const LEVEL_COLORS: { [key: string]: string } = {
  N5: "#22c55e",
  N4: "#14b8a6",
  N3: "#8b5cf6",
  N2: "#f59e0b",
  N1: "#991b1b",
};

export default function MockTest() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    loadUserAndQuestions();
  }, []);

  useEffect(() => {
    if (isStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isStarted, timeLeft]);

  async function loadUserAndQuestions() {
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

    // Fetch mock test questions (60 total: 35% kanji, 35% grammar, 30% reading)
    try {
      const fetchedQuestions = await getMockTestQuestions(
        userData?.target_level || "N5",
        60
      );
      setQuestions(fetchedQuestions);
      setAnswers(new Array(fetchedQuestions.length).fill(null));
    } catch (error) {
      console.error("Error loading questions:", error);
    }

    setLoading(false);
  }

  function startTest() {
    setIsStarted(true);
    setStartTime(Date.now());
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  async function handleAnswer(answerIndex: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);

    // Save result
    if (user && currentQuestion) {
      const isCorrect = answerIndex === currentQuestion.answer_index;
      await saveQuestionResult(user.id, currentQuestion.id, isCorrect, "mock_test");
    }
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1]);
      setShowExplanation(answers[currentIndex + 1] !== null);
    } else {
      await finishTest();
    }
  }

  async function finishTest() {
    if (!user) return;

    const correctCount = answers.filter(
      (answer, idx) => answer === questions[idx].answer_index
    ).length;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // Calculate section scores
    const sections = {
      kanji: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
    };

    questions.forEach((q, idx) => {
      const category = q.category as "kanji" | "grammar" | "reading";
      if (sections[category]) {
        sections[category].total++;
        if (answers[idx] === q.answer_index) {
          sections[category].correct++;
        }
      }
    });

    await saveMockTestResult(
      user.id,
      user.target_level,
      correctCount,
      questions.length,
      timeTaken,
      sections
    );

    router.push(`/progress?score=${correctCount}&total=${questions.length}&mode=mock`);
  }

  if (loading) {
    return (
      <AppLayout>
        <SEO title="Mock Test - Master JLPT" />
        <BackButton />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading mock test...</p>
        </div>
      </AppLayout>
    );
  }

  if (!questions.length) {
    return (
      <AppLayout>
        <SEO title="Mock Test - Master JLPT" />
        <BackButton />
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-bold">No questions available</h2>
              <p className="text-muted-foreground">
                There are no questions for mock tests yet.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!isStarted) {
    return (
      <AppLayout>
        <SEO title="Mock Test - Master JLPT" />
        <BackButton />
        <div className="container py-16 max-w-2xl">
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <Badge
                  style={{ backgroundColor: LEVEL_COLORS[user?.target_level] }}
                  className="text-white text-lg px-4 py-2"
                >
                  {user?.target_level} Mock Test
                </Badge>
                <h1 className="text-3xl font-bold">Ready to start?</h1>
                <p className="text-muted-foreground">
                  This mock test contains {questions.length} questions and takes 60 minutes.
                </p>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Structure:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Kanji: {questions.filter((q) => q.category === "kanji").length} questions (35%)</li>
                    <li>• Grammar: {questions.filter((q) => q.category === "grammar").length} questions (35%)</li>
                    <li>• Reading: {questions.filter((q) => q.category === "reading").length} questions (30%)</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>• Answer all questions to the best of your ability</p>
                <p>• You can review and change answers before submitting</p>
                <p>• Timer starts when you click "Start Test"</p>
              </div>

              <Button onClick={startTest} size="lg" className="w-full">
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const levelColor = LEVEL_COLORS[currentQuestion.level] || "#22c55e";
  const options = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : [];

  return (
    <AppLayout>
      <SEO title={`Mock Test - Master JLPT`} />
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
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <span className="text-sm font-medium">
                {currentIndex + 1} / {questions.length}
              </span>
            </div>
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
                  "Finish Test"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}