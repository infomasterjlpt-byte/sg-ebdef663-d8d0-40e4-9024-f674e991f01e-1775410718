import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, ChevronRight, Check, X, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLevel } from "@/contexts/LevelContext";

const LEVEL_COLORS: { [key: string]: string } = {
  N5: "#22c55e",
  N4: "#14b8a6",
  N3: "#8b5cf6",
  N2: "#f59e0b",
  N1: "#991b1b",
};

interface Question {
  id: string;
  level: string;
  category: string;
  question: string;
  sentence: string | null;
  passage: string | null;
  options: string[];
  answer_index: number;
  explanation: string | null;
  example_sentence: string | null;
}

export default function MockTest() {
  const router = useRouter();
  const { level, levelLoaded } = useLevel();
  const [userId, setUserId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (levelLoaded) loadQuestions();
  }, [levelLoaded, level]);

  useEffect(() => {
    if (isStarted && !isFinished && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && isStarted) finishTest();
  }, [isStarted, isFinished, timeLeft]);

  async function loadQuestions() {
    setLoading(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push("/auth/login"); return; }
    setUserId(authUser.id);

    const [kanjiData, grammarData, readingData] = await Promise.all([
      supabase.from("questions").select("*").eq("level", level).eq("category", "kanji").limit(20),
      supabase.from("questions").select("*").eq("level", level).eq("category", "grammar").limit(20),
      supabase.from("questions").select("*").eq("level", level).eq("category", "reading").limit(20),
    ]);

    const raw = [
      ...(kanjiData.data || []),
      ...(grammarData.data || []),
      ...(readingData.data || []),
    ].sort(() => Math.random() - 0.5);

    // Shuffle options and update answer_index
    const formatted: Question[] = raw.map((q: any) => {
      const originalOptions: string[] = Array.isArray(q.options) ? q.options : [];
      const correctAnswer = originalOptions[q.answer_index];
      const shuffledOptions = [...originalOptions].sort(() => Math.random() - 0.5);
      return {
        id: q.id,
        level: q.level,
        category: q.category,
        question: q.question,
        sentence: q.sentence || null,
        passage: q.passage || null,
        options: shuffledOptions,
        answer_index: shuffledOptions.indexOf(correctAnswer),
        explanation: q.explanation,
        example_sentence: q.example_sentence,
      };
    });

    setQuestions(formatted);
    setAnswers(new Array(formatted.length).fill(null));
    setLoading(false);
  }

  function startTest() {
    setIsStarted(true);
    setStartTime(Date.now());
  }

  async function handleAnswer(answerIndex: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = answerIndex;
    setAnswers(newAnswers);
  }

  async function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextAnswer = answers[currentIndex + 1];
      setSelectedAnswer(nextAnswer ?? null);
      setShowExplanation(nextAnswer !== null);
    } else {
      await finishTest();
    }
  }

  async function finishTest() {
    setIsFinished(true);
    if (!userId) return;

    const correctCount = answers.filter((a, i) => a === questions[i]?.answer_index).length;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // Save each answer to practice_sessions
    await Promise.all(
      questions.map((q, i) => {
        if (answers[i] === null) return Promise.resolve();
        return supabase.from("practice_sessions").insert({
          user_id: userId,
          level: q.level,
          category: q.category,
          group_name: "Mock Test",
          question_id: q.id,
          is_correct: answers[i] === q.answer_index,
          answered_at: new Date().toISOString(),
        });
      })
    );

    router.push(`/mock-test/results?score=${correctCount}&total=${questions.length}&time=${timeTaken}&level=${level}`);
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading mock test...</p>
        </div>
      </AppLayout>
    );
  }

  if (!questions.length) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-bold">No questions available</h2>
              <p className="text-muted-foreground">There are no questions for {level} mock tests yet.</p>
              <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!isStarted) {
    const levelColor = LEVEL_COLORS[level] || "#22c55e";
    return (
      <AppLayout>
        <SEO title="Mock Test - Master JLPT" description="Test your JLPT knowledge" />
        <div className="max-w-2xl mx-auto py-8 px-4">
          <Card>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-3">
                <Badge style={{ backgroundColor: levelColor, color: 'white', fontSize: '16px', padding: '6px 16px' }}>
                  {level} Mock Test
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-bold">Ready to start?</h1>
                <p className="text-muted-foreground">
                  This mock test contains {questions.length} questions. You have 60 minutes.
                </p>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Structure:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Kanji: {questions.filter(q => q.category === "kanji").length} questions</li>
                    <li>• Grammar: {questions.filter(q => q.category === "grammar").length} questions</li>
                    <li>• Reading: {questions.filter(q => q.category === "reading").length} questions</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Answer all questions to the best of your ability</p>
                <p>• Timer starts when you click "Start Test"</p>
                <p>• Your answers are saved to your progress</p>
              </div>

              <Button onClick={startTest} size="lg" className="w-full bg-[#cc1f1f] hover:bg-[#b01b1b] text-white">
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const currentQuestion = questions[currentIndex];
  const levelColor = LEVEL_COLORS[currentQuestion.level] || "#22c55e";
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <AppLayout>
      <SEO title="Mock Test - Master JLPT" description="Test your JLPT knowledge" />
      <div className="max-w-3xl mx-auto py-4 sm:py-8 px-3 sm:px-4">

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge style={{ backgroundColor: levelColor, color: 'white' }}>{currentQuestion.level}</Badge>
              <span className="text-muted-foreground text-sm capitalize">{currentQuestion.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1 text-sm font-medium ${timeLeft < 300 ? 'text-red-600' : ''}`}>
                <Clock className="h-4 w-4" />
                {minutes}:{seconds.toString().padStart(2, "0")}
              </div>
              <span className="text-sm text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question card */}
        <Card>
          <CardContent className="p-4 sm:p-8 space-y-4">

            {/* Reading passage */}
            {currentQuestion.category === "reading" && currentQuestion.passage && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-gray-500 mb-2">Passage:</p>
                <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.passage}</p>
              </div>
            )}

            {/* Kanji/Grammar sentence */}
            {currentQuestion.category !== "reading" && currentQuestion.sentence && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-base text-gray-800 leading-relaxed">{currentQuestion.sentence}</p>
              </div>
            )}

            {/* Question */}
            <h2 className="text-base sm:text-lg font-bold text-gray-800" style={{ wordBreak: 'keep-all' }}>
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="space-y-2 sm:space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.answer_index;
                const showCorrect = showExplanation && isCorrect;
                const showWrong = showExplanation && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-3 sm:p-4 text-left rounded-lg border-2 transition-all ${
                      showCorrect ? "border-green-500 bg-green-50"
                      : showWrong ? "border-red-500 bg-red-50"
                      : isSelected ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                    } ${selectedAnswer !== null ? "cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground text-sm">{optionLabels[index]}</span>
                        <span className={`text-sm sm:text-base ${showCorrect ? "text-green-700 font-medium" : showWrong ? "text-red-700 font-medium" : ""}`}>
                          {option}
                        </span>
                      </div>
                      {showCorrect && <Check className="h-4 w-4 text-green-600 shrink-0" />}
                      {showWrong && <X className="h-4 w-4 text-red-600 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-1">Explanation</p>
                <p className="text-xs sm:text-sm text-blue-700">{currentQuestion.explanation}</p>
              </div>
            )}

            {/* Next button */}
            {showExplanation && (
              <Button onClick={handleNext} className="w-full bg-[#cc1f1f] hover:bg-[#b01b1b] text-white" size="lg">
                {currentIndex < questions.length - 1 ? <>Next Question <ChevronRight className="ml-2 h-4 w-4" /></> : "Finish Test"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
