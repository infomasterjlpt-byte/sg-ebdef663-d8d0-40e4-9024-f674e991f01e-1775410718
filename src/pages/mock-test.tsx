import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { getQuestions } from "@/services/questionService";
import { Check, X, Lock, Clock, ChevronRight, Trophy } from "lucide-react";
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

type TestSection = {
  name: string;
  type: string;
  timeLimit: number;
  questionCount: number;
};

const LEVEL_COLORS = {
  N5: "bg-level-n5",
  N4: "bg-level-n4",
  N3: "bg-level-n3",
  N2: "bg-level-n2",
  N1: "bg-level-n1",
};

const TEST_SECTIONS: { [key: string]: TestSection[] } = {
  N5: [
    { name: "Vocabulary", type: "vocabulary", timeLimit: 25 * 60, questionCount: 20 },
    { name: "Grammar & Reading", type: "grammar", timeLimit: 50 * 60, questionCount: 30 },
  ],
  N4: [
    { name: "Vocabulary", type: "vocabulary", timeLimit: 25 * 60, questionCount: 25 },
    { name: "Grammar & Reading", type: "grammar", timeLimit: 50 * 60, questionCount: 35 },
  ],
  N3: [
    { name: "Vocabulary", type: "vocabulary", timeLimit: 30 * 60, questionCount: 30 },
    { name: "Grammar & Reading", type: "grammar", timeLimit: 70 * 60, questionCount: 40 },
  ],
  N2: [
    { name: "Vocabulary", type: "vocabulary", timeLimit: 35 * 60, questionCount: 35 },
    { name: "Grammar & Reading", type: "grammar", timeLimit: 105 * 60, questionCount: 45 },
  ],
  N1: [
    { name: "Vocabulary", type: "vocabulary", timeLimit: 35 * 60, questionCount: 40 },
    { name: "Grammar & Reading", type: "grammar", timeLimit: 110 * 60, questionCount: 50 },
  ],
};

export default function MockTest() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [testState, setTestState] = useState<"setup" | "active" | "results">("setup");
  const [currentSection, setCurrentSection] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (testState === "active" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSectionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [testState, timeRemaining]);

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

  async function startTest() {
    if (!selectedLevel || (!userProfile?.is_premium && selectedLevel !== "N5")) return;

    setLoading(true);
    const sections = TEST_SECTIONS[selectedLevel];
    const section = sections[0];

    const { data } = await getQuestions(selectedLevel, section.type, section.questionCount);
    if (data) {
      setQuestions(data);
      setCurrentIndex(0);
      setAnswers({});
      setTimeRemaining(section.timeLimit);
      setStartTime(new Date());
      setTestState("active");
      setCurrentSection(0);
    }
    setLoading(false);
  }

  async function handleSectionComplete() {
    const sections = TEST_SECTIONS[selectedLevel];
    
    if (currentSection < sections.length - 1) {
      const nextSection = sections[currentSection + 1];
      setLoading(true);
      const { data } = await getQuestions(selectedLevel, nextSection.type, nextSection.questionCount);
      if (data) {
        setQuestions(data);
        setCurrentIndex(0);
        setTimeRemaining(nextSection.timeLimit);
        setCurrentSection(currentSection + 1);
      }
      setLoading(false);
    } else {
      await calculateResults();
    }
  }

  async function calculateResults() {
    const allQuestions = questions;
    let correct = 0;
    let vocabCorrect = 0;
    let grammarCorrect = 0;
    let vocabTotal = 0;
    let grammarTotal = 0;

    allQuestions.forEach((q, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === q.answer;
      
      if (isCorrect) correct++;
      
      if (q.type === "vocabulary") {
        vocabTotal++;
        if (isCorrect) vocabCorrect++;
      } else {
        grammarTotal++;
        if (isCorrect) grammarCorrect++;
      }

      supabase.from("results").insert({
        user_id: user.id,
        question_id: q.id,
        correct: isCorrect,
        mode: "mock_test",
      });
    });

    const totalQuestions = allQuestions.length;
    const score = Math.round((correct / totalQuestions) * 100);
    const passed = score >= 60;
    const timeTaken = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;

    await supabase.from("mock_tests").insert({
      user_id: user.id,
      level: selectedLevel,
      score,
      total_questions: totalQuestions,
      time_taken: timeTaken,
    });

    setTestResults({
      score,
      correct,
      totalQuestions,
      passed,
      vocabScore: vocabTotal > 0 ? Math.round((vocabCorrect / vocabTotal) * 100) : 0,
      grammarScore: grammarTotal > 0 ? Math.round((grammarCorrect / grammarTotal) * 100) : 0,
    });

    setTestState("results");
    setShowResults(true);
  }

  function handleAnswer(questionIndex: number, answerIndex: number) {
    setAnswers(prev => ({ ...prev, [questionIndex]: answerIndex }));
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  const canAccessLevel = userProfile?.is_premium || selectedLevel === "N5";
  const currentQuestion = questions[currentIndex];
  const sections = selectedLevel ? TEST_SECTIONS[selectedLevel] : [];
  const currentSectionInfo = sections[currentSection];

  if (testState === "results" && testResults) {
    return (
      <>
        <SEO title="Mock Test Results - JLPT Master" description="Your mock test results" />
        <AppLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Test Results</CardTitle>
                  <Badge className={`${LEVEL_COLORS[selectedLevel as keyof typeof LEVEL_COLORS]} text-white`}>
                    {selectedLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <div className="flex items-center justify-center mb-4">
                    {testResults.passed ? (
                      <Trophy className="h-16 w-16 text-accent" />
                    ) : (
                      <X className="h-16 w-16 text-destructive" />
                    )}
                  </div>
                  <h2 className="text-4xl font-bold mb-2">{testResults.score}%</h2>
                  <p className="text-lg text-muted-foreground">
                    {testResults.correct} / {testResults.totalQuestions} correct
                  </p>
                  <Badge variant={testResults.passed ? "default" : "destructive"} className="mt-4">
                    {testResults.passed ? "PASSED" : "FAILED"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vocabulary Section</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-accent">{testResults.vocabScore}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Grammar & Reading</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-accent">{testResults.grammarScore}%</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Question Review</h3>
                  {questions.map((q, index) => {
                    const userAnswer = answers[index];
                    const isCorrect = userAnswer === q.answer;
                    return (
                      <Card key={index} className={isCorrect ? "border-green-600" : "border-destructive"}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3 mb-3">
                            {isCorrect ? (
                              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                            ) : (
                              <X className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium mb-2">{q.question}</p>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Correct Answer: </span>
                                {q.options[q.answer]}
                              </p>
                              {userAnswer !== undefined && !isCorrect && (
                                <p className="text-sm text-destructive">
                                  <span className="font-medium">Your Answer: </span>
                                  {q.options[userAnswer]}
                                </p>
                              )}
                              <p className="text-sm mt-2">{q.explanation}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => router.push("/practice")} variant="outline" className="flex-1">
                    Practice More
                  </Button>
                  <Button onClick={() => {
                    setTestState("setup");
                    setShowResults(false);
                    setTestResults(null);
                    setQuestions([]);
                    setAnswers({});
                  }} className="flex-1">
                    Take Another Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </>
    );
  }

  if (testState === "active" && currentQuestion) {
    return (
      <>
        <SEO title="Mock Test - JLPT Master" description="JLPT mock examination" />
        <AppLayout>
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className={`${LEVEL_COLORS[selectedLevel as keyof typeof LEVEL_COLORS]} text-white`}>
                    {selectedLevel} - {currentSectionInfo.name}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className={`font-mono font-bold ${timeRemaining < 60 ? "text-destructive" : "text-accent"}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-accent h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Question {currentIndex + 1} of {questions.length}
                  </p>
                  <h2 className="text-lg font-medium">{currentQuestion.question}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = answers[currentIndex] === index;
                    return (
                      <Button
                        key={index}
                        variant={isSelected ? "default" : "outline"}
                        className="h-auto py-4 justify-start text-left"
                        onClick={() => handleAnswer(currentIndex, index)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0">
                            {isSelected ? "✓" : String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1">{option}</span>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                  {currentIndex < questions.length - 1 ? (
                    <Button onClick={() => setCurrentIndex(currentIndex + 1)} className="flex-1">
                      Next Question <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleSectionComplete} className="flex-1">
                      {currentSection < sections.length - 1 ? "Next Section" : "Finish Test"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      </>
    );
  }

  return (
    <>
      <SEO title="Mock Test - JLPT Master" description="Full JLPT mock examination" />
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mock Test</h1>
            <p className="text-muted-foreground">
              Full timed JLPT-style examination
            </p>
          </div>

          {!userProfile?.is_premium && (
            <Alert>
              <AlertDescription>
                Mock tests are premium only (except N5).{" "}
                <Button variant="link" className="h-auto p-0 text-accent" onClick={() => router.push("/pricing")}>
                  Upgrade to Premium
                </Button>{" "}
                to unlock all levels.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Select Test Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {selectedLevel && (
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Test Structure</h3>
                  {TEST_SECTIONS[selectedLevel].map((section, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">{section.name}</p>
                        <p className="text-sm text-muted-foreground">{section.questionCount} questions</p>
                      </div>
                      <Badge variant="outline">
                        {Math.floor(section.timeLimit / 60)} min
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={startTest}
                disabled={!selectedLevel || loading || !canAccessLevel}
                className="w-full"
              >
                {loading ? "Starting Test..." : "Start Mock Test"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}