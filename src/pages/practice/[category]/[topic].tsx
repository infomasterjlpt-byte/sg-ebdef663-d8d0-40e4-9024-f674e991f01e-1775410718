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
  options: string[];
  answer_index: number;
  explanation: string | null;
  example_sentence: string | null;
}

const categoryInfo: Record<string, { icon: string; title: string }> = {
  kanji: { icon: "漢字", title: "Kanji" },
  grammar: { icon: "文法", title: "Grammar" },
  reading: { icon: "読解", title: "Reading" }
};

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category && topic && typeof category === "string" && typeof topic === "string") {
      console.log("📚 Fetching questions for:", { level, category, topic });
      loadQuestions();
    }
  }, [category, topic, level]); // Re-fetch when level changes

  async function loadQuestions() {
    if (!category || !topic || typeof category !== "string" || typeof topic !== "string") return;

    setLoading(true);
    setQuestions([]); // Clear previous data
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResults(false);

    const user = await authService.getCurrentUser();
    
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUserId(user.id);

    console.log("🔍 Querying questions table with:", { level, category, topic: decodeURIComponent(topic) });

    // Fetch questions for this group
    const { data, error } = await supabase
      .from("questions")
      .select("*")
      .eq("level", level)
      .eq("category", category)
      .eq("group", decodeURIComponent(topic))
      .limit(20);

    if (error) {
      console.error("Error fetching questions:", error);
      setLoading(false);
      return;
    }

    console.log("📦 Found questions:", data?.length || 0);

    // Shuffle questions client-side for better randomization
    const shuffled = (data || []).sort(() => Math.random() - 0.5);

    // Format questions with proper types
    const formattedQuestions: Question[] = shuffled.map(q => ({
      id: q.id,
      question: q.question,
      options: Array.isArray(q.options) ? (q.options as string[]) : [],
      answer_index: q.answer_index,
      explanation: q.explanation,
      example_sentence: q.example_sentence
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
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const handlePracticeAgain = () => {
    loadQuestions(); // This will re-shuffle and reset everything
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (questions.length === 0) {
    const topicName = topic ? decodeURIComponent(topic as string) : "";
    const categoryData = categoryInfo[category as string] || { icon: "📚", title: String(category) };

    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/practice" className="hover:text-foreground">Practice</Link>
            <span>/</span>
            <Link href={`/practice/${category}`} className="hover:text-foreground">{categoryData.title}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{topicName}</span>
          </div>

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

  const topicName = topic ? decodeURIComponent(topic as string) : "";
  const categoryData = categoryInfo[category as string] || { icon: "📚", title: String(category) };
  const currentQuestion = questions[currentIndex];
  const hasAnswered = answeredQuestions[currentIndex];
  const score = correctAnswers.filter(Boolean).length;
  const percentage = Math.round((score / questions.length) * 100);

  if (showResults) {
    let emoji = "😢";
    if (percentage >= 80) emoji = "🎉";
    else if (percentage >= 50) emoji = "🙂";

    return (
      <AppLayout>
        <SEO 
          title={`Results - ${topicName} - ${categoryData.title} Practice`}
          description="Practice session results"
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/practice" className="hover:text-foreground">Practice</Link>
            <span>/</span>
            <Link href={`/practice/${category}`} className="hover:text-foreground">{categoryData.title}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{topicName}</span>
          </div>

          <Card className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
              <p className="text-muted-foreground mb-8">Great work completing this session</p>
              
              <div className="mb-8">
                <div className="text-6xl font-bold text-primary mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-2xl text-muted-foreground mb-4">
                  {percentage}% Correct
                </div>
                <div className="text-6xl mb-4">{emoji}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handlePracticeAgain}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
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

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <AppLayout>
      <SEO 
        title={`${topicName} - ${categoryData.title} Practice`}
        description={`Practice ${categoryData.title} questions for ${topicName}`}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">Practice</Link>
          <span>/</span>
          <Link href={`/practice/${category}`} className="hover:text-foreground">{categoryData.title}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{topicName}</span>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <Card className="p-8">
          {/* Reading Passage (for reading category) */}
          {category === "reading" && currentQuestion.example_sentence && currentQuestion.example_sentence.trim() !== "" && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm font-medium text-gray-500 mb-2">Passage:</p>
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                {currentQuestion.example_sentence}
              </p>
            </div>
          )}

          {/* Example Sentence (for kanji and grammar) */}
          {category !== "reading" && currentQuestion.example_sentence && currentQuestion.example_sentence.trim() !== "" && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-base text-gray-700">{currentQuestion.example_sentence}</p>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

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
                    showCorrect
                      ? "border-green-500 bg-green-50"
                      : showIncorrect
                      ? "border-red-500 bg-red-50"
                      : isSelected
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-primary/50"
                  } ${hasAnswered ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-muted-foreground">
                        {optionLabels[index]}
                      </span>
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
            <div className="p-4 bg-gray-100 rounded-lg mb-6">
              <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}

          {hasAnswered && (
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
            </Button>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}