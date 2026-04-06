import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getRandomQuestions, saveQuestionResult } from "@/services/questionService";
import { Check, X, Lock, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Question = {
  id: string;
  level: string;
  category: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
  example_sentence?: string;
};

const LEVEL_COLORS = {
  N5: "bg-green-500",
  N4: "bg-cyan-500",
  N3: "bg-purple-500",
  N2: "bg-amber-500",
  N1: "bg-red-500",
};

const GUEST_QUESTION_LIMIT = 5;

export default function Practice() {
  const router = useRouter();
  const { level, category } = router.query;

  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestQuestionsAnswered, setGuestQuestionsAnswered] = useState(0);
  const [guestCorrectAnswers, setGuestCorrectAnswers] = useState(0);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (level && category) {
      setSelectedLevel(level as string);
      setSelectedType(category as string);
    }
  }, [level, category]);

  useEffect(() => {
    if (selectedLevel && selectedType) {
      loadQuestions();
    }
  }, [selectedLevel, selectedType]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsGuest(true);
      return;
    }

    setUser(user);
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    
    setUserProfile(profile);
  }

  async function loadQuestions() {
    if (!isGuest && !userProfile?.is_premium && selectedLevel !== "N5") {
      return;
    }

    setLoading(true);
    const questionCount = isGuest ? GUEST_QUESTION_LIMIT : 10;
    const { data, error } = await getRandomQuestions(selectedLevel, selectedType, questionCount);
    if (data) {
      setQuestions(data as any[]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(new Date());
      setGuestQuestionsAnswered(0);
      setGuestCorrectAnswers(0);
      setShowGuestPrompt(false);
    }
    setLoading(false);
  }

  async function handleAnswer(answerIndex: number) {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = questions[currentIndex];
    const isCorrect = answerIndex === question.answer_index;

    if (isGuest) {
      setGuestQuestionsAnswered(prev => prev + 1);
      if (isCorrect) {
        setGuestCorrectAnswers(prev => prev + 1);
      }

      if (guestQuestionsAnswered + 1 >= GUEST_QUESTION_LIMIT) {
        setTimeout(() => setShowGuestPrompt(true), 1500);
      }
    } else if (user) {
      await saveQuestionResult(
        user.id,
        question.id,
        isCorrect,
        "practice"
      );
    }
  }

  function handleNext() {
    if (isGuest && guestQuestionsAnswered >= GUEST_QUESTION_LIMIT) {
      setShowGuestPrompt(true);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      if (isGuest) {
        setShowGuestPrompt(true);
      } else {
        router.push("/dashboard");
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (showGuestPrompt) {
    return (
      <>
        <SEO title="Practice Complete - Master JLPT" />
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Great job!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div>
                <p className="text-4xl font-bold mb-2">
                  {guestCorrectAnswers}/{GUEST_QUESTION_LIMIT}
                </p>
                <p className="text-muted-foreground">correct answers</p>
              </div>
              
              <Alert>
                <AlertDescription className="text-center">
                  <strong>Create a free account</strong> to save your progress and continue studying
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
              </div>

              <Button variant="ghost" className="w-full" onClick={() => router.push("/levels")}>
                Try another level
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <SEO title="Practice Mode - Master JLPT" />
        <div className="min-h-screen bg-white p-4">
          <div className="container max-w-4xl mx-auto py-8">
            <div className="mb-6">
              <Button variant="ghost" asChild>
                <Link href={isGuest ? "/levels" : "/dashboard"}>
                  ← Back
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Select Practice Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Level</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N5">N5 - Beginner</SelectItem>
                      <SelectItem value="N4">N4 - Elementary</SelectItem>
                      <SelectItem value="N3">N3 - Intermediate</SelectItem>
                      <SelectItem value="N2">N2 - Upper Intermediate</SelectItem>
                      <SelectItem value="N1">N1 - Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kanji">Kanji</SelectItem>
                      <SelectItem value="grammar">Grammar</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isGuest && !userProfile?.is_premium && selectedLevel !== "N5" && (
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>
                      Upgrade to Premium to access {selectedLevel} questions.
                      <Link href="/pricing" className="text-primary font-medium ml-1">
                        View Plans
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                {isGuest && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-900">
                      Try <strong>{GUEST_QUESTION_LIMIT} free questions</strong> — no account needed
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  const question = questions[currentIndex];
  const isCorrect = showResult && selectedAnswer === question?.answer_index;
  const canAccessLevel = isGuest || userProfile?.is_premium || selectedLevel === "N5";
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      <SEO title="Practice Mode - Master JLPT" />
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="container py-4">
            <div className="flex items-center justify-between mb-2">
              <Button variant="ghost" onClick={() => router.push(isGuest ? "/levels" : "/dashboard")}>
                ← Back
              </Button>
              <div className="text-sm text-gray-600">
                {isGuest ? `${guestQuestionsAnswered}/${GUEST_QUESTION_LIMIT}` : `${currentIndex + 1}/${questions.length}`}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={`${LEVEL_COLORS[question.level as keyof typeof LEVEL_COLORS]} text-white`}>
                  {question.level} - Question {currentIndex + 1}/{questions.length}
                </Badge>
                <Badge variant="outline">{question.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">{question.question}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectOption = index === question.answer_index;
                  const showCorrect = showResult && isCorrectOption;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        showCorrect
                          ? "border-green-500 bg-green-50"
                          : showWrong
                          ? "border-red-500 bg-red-50"
                          : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      } ${showResult ? "cursor-default" : "cursor-pointer"}`}
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

              {showResult && (
                <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-semibold">
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Correct Answer: </span>
                    {question.options[question.answer_index]}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Explanation: </span>
                    {question.explanation}
                  </div>
                  {question.example_sentence && (
                    <div className="text-sm mt-2">
                      <span className="font-medium">Example: </span>
                      {question.example_sentence}
                    </div>
                  )}
                </div>
              )}

              {showResult && (
                <Button onClick={handleNext} className="w-full" size="lg">
                  {currentIndex < questions.length - 1 ? "Next Question" : "Finish"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}