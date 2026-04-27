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

interface Question {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string | null;
  example_sentence: string | null;
}

const optionLabels = ["A", "B", "C", "D"];

export default function N5KanjiQuestionsPage() {
  const router = useRouter();
  const { group } = router.query;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!group || typeof group !== "string") return;

      const user = await authService.getCurrentUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      // Fetch questions from questions table
      const { data: questionData, error } = await supabase
        .from("questions")
        .select("*")
        .eq("level", "N5")
        .eq("category", "kanji")
        .eq("group", decodeURIComponent(group))
        .limit(20);

      if (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
        return;
      }

      // Format options from Json to string[] and shuffle questions
      const formattedQuestions: Question[] = (questionData || []).map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? (q.options as string[]) : [],
        answer_index: q.answer_index,
        explanation: q.explanation,
        example_sentence: q.example_sentence
      }));

      // Shuffle questions randomly
      const shuffled = formattedQuestions.sort(() => Math.random() - 0.5);
      
      setQuestions(shuffled);
      setAnsweredQuestions(new Array(shuffled.length).fill(false));
      setCorrectAnswers(new Array(shuffled.length).fill(false));
      setLoading(false);
    };

    loadQuestions();
  }, [group, router]);

  const currentQuestion = questions[currentIndex];
  const hasAnswered = answeredQuestions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion?.answer_index;

  const handleAnswerSelect = async (answerIndex: number) => {
    if (hasAnswered) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === currentQuestion.answer_index;

    // Update state
    const newAnswered = [...answeredQuestions];
    newAnswered[currentIndex] = true;
    setAnsweredQuestions(newAnswered);

    const newCorrect = [...correctAnswers];
    newCorrect[currentIndex] = correct;
    setCorrectAnswers(newCorrect);

    // Save to database
    if (userId && group) {
      const { error } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: userId,
          level: "N5",
          category: "kanji",
          group_name: decodeURIComponent(group as string),
          question_id: currentQuestion.id,
          is_correct: correct,
          answered_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving answer:", error);
      }
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
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnsweredQuestions(new Array(questions.length).fill(false));
    setCorrectAnswers(new Array(questions.length).fill(false));
    setShowResults(false);
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
    return (
      <AppLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/practice" className="hover:text-foreground">
              Practice
            </Link>
            <span>/</span>
            <Link href="/practice/n5/kanji" className="hover:text-foreground">
              N5
            </Link>
            <span>/</span>
            <Link href="/practice/n5/kanji" className="hover:text-foreground">
              Kanji
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{group ? decodeURIComponent(group as string) : ""}</span>
          </div>

          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No questions available</h3>
            <p className="text-muted-foreground mb-4">
              There are no questions available for this group yet.
            </p>
            <Link href="/practice/n5/kanji">
              <Button>Back to Groups</Button>
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const groupName = group ? decodeURIComponent(group as string) : "";
  const score = correctAnswers.filter(Boolean).length;
  const percentage = Math.round((score / questions.length) * 100);

  // Results Screen
  if (showResults) {
    let emoji = "😢";
    if (percentage >= 80) emoji = "🎉";
    else if (percentage >= 50) emoji = "🙂";

    return (
      <AppLayout>
        <SEO 
          title={`Results - ${groupName} - N5 Kanji Practice - Master JLPT`}
          description="Practice session results"
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/practice" className="hover:text-foreground">
              Practice
            </Link>
            <span>/</span>
            <Link href="/practice/n5/kanji" className="hover:text-foreground">
              N5
            </Link>
            <span>/</span>
            <Link href="/practice/n5/kanji" className="hover:text-foreground">
              Kanji
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{groupName}</span>
          </div>

          <Card className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
              <p className="text-muted-foreground mb-8">Great work completing this practice session</p>
              
              {/* Score Display */}
              <div className="mb-8">
                <div className="text-6xl font-bold text-primary mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-2xl text-muted-foreground mb-4">
                  {percentage}% Correct
                </div>
                <div className="text-6xl mb-4">
                  {emoji}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handlePracticeAgain}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  size="lg"
                >
                  Practice Again
                </Button>
                <Link href="/practice/n5/kanji">
                  <Button variant="outline" size="lg">
                    Back to Groups
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Question Screen
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <AppLayout>
      <SEO 
        title={`${groupName} - N5 Kanji Practice - Master JLPT`}
        description={`Practice N5 Kanji questions for ${groupName}`}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">
            Practice
          </Link>
          <span>/</span>
          <Link href="/practice/n5/kanji" className="hover:text-foreground">
            N5
          </Link>
          <span>/</span>
          <Link href="/practice/n5/kanji" className="hover:text-foreground">
            Kanji
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{groupName}</span>
        </div>

        {/* Progress Bar */}
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

        {/* Question Card */}
        <Card className="p-8">
          {/* Example Sentence (if not empty) */}
          {currentQuestion.example_sentence && currentQuestion.example_sentence.trim() !== "" && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-base text-gray-700">{currentQuestion.example_sentence}</p>
            </div>
          )}

          {/* Question */}
          <h2 className="text-2xl font-bold mb-6">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
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
                    {showCorrect && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {showIncorrect && (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after answering) */}
          {hasAnswered && currentQuestion.explanation && (
            <div className="p-4 bg-gray-100 rounded-lg mb-6">
              <p className="text-sm text-gray-700">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next Button */}
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