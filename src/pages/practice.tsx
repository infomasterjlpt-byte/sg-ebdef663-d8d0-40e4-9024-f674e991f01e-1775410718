import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getQuestions, saveQuestionResult } from "@/services/questionService";
import { Check, X, Lock, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Question = {
  id: string;
  level: string;
  type: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  example_sentence?: string;
};

const LEVEL_COLORS = {
  N5: "bg-level-n5",
  N4: "bg-level-n4",
  N3: "bg-level-n3",
  N2: "bg-level-n2",
  N1: "bg-level-n1",
};

export default function Practice() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

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
  }

  async function loadQuestions() {
    if (!selectedLevel || !selectedType) return;

    if (!userProfile?.is_premium && selectedLevel !== "N5") {
      return;
    }

    setLoading(true);
    const { data, error } = await getQuestions(selectedLevel, selectedType, 10);
    if (data) {
      setQuestions(data);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setStartTime(new Date());
    }
    setLoading(false);
  }

  async function handleAnswer(answerIndex: number) {
    if (showResult || !user) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = questions[currentIndex];
    const isCorrect = answerIndex === question.answer;

    await saveQuestionResult({
      userId: user.id,
      questionId: question.id,
      correct: isCorrect,
      mode: "practice",
    });
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }

  const question = questions[currentIndex];
  const isCorrect = showResult && selectedAnswer === question?.answer;
  const canAccessLevel = userProfile?.is_premium || selectedLevel === "N5";

  return (
    <>
      <SEO title="Practice - JLPT Master" description="Practice JLPT questions" />
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Practice Mode</h1>
            <p className="text-muted-foreground">
              Practice questions for your target level
            </p>
          </div>

          {!userProfile?.is_premium && (
            <Alert>
              <AlertDescription>
                Free users can practice N5 only.{" "}
                <Button variant="link" className="h-auto p-0 text-accent" onClick={() => router.push("/pricing")}>
                  Upgrade to Premium
                </Button>{" "}
                to unlock N4-N1.
              </AlertDescription>
            </Alert>
          )}

          {questions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Select Practice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Level</label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose level" />
                      </SelectTrigger>
                      <SelectContent>
                        {["N5", "N4", "N3", "N2", "N1"].map((level) => {
                          const locked = !userProfile?.is_premium && level !== "N5";
                          return (
                            <SelectItem key={level} value={level} disabled={locked}>
                              <div className="flex items-center gap-2">
                                <span>{level}</span>
                                {locked && <Lock className="h-3 w-3 opacity-35" />}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Question Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vocabulary">Vocabulary</SelectItem>
                        <SelectItem value="grammar">Grammar</SelectItem>
                        <SelectItem value="reading">Reading</SelectItem>
                        <SelectItem value="kanji">Kanji</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={loadQuestions}
                  disabled={!selectedLevel || !selectedType || loading || !canAccessLevel}
                  className="w-full"
                >
                  {loading ? "Loading..." : "Start Practice"}
                </Button>
              </CardContent>
            </Card>
          ) : (
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
                    <Badge className={`${LEVEL_COLORS[question.level as keyof typeof LEVEL_COLORS]} text-white`}>
                      {question.level} - Question {currentIndex + 1}/{questions.length}
                    </Badge>
                    <Badge variant="outline">{question.type}</Badge>
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
                            <span className="text-green-600">Correct!</span>
                          </>
                        ) : (
                          <>
                            <X className="h-5 w-5 text-destructive" />
                            <span className="text-destructive">Incorrect</span>
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
                        "Finish Practice"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}