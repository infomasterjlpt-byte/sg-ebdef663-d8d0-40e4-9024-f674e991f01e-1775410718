import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { practiceService, type PracticeQuestion } from "@/services/practiceService";
import { ArrowLeft, Check, X } from "lucide-react";

const categoryNames: Record<string, string> = {
  kanji: "Kanji",
  grammar: "Grammar",
  reading: "Reading"
};

const optionLabels = ["A", "B", "C", "D"];

export default function PracticeQuestionsPage() {
  const router = useRouter();
  const { category, topic } = router.query;
  
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!category || !topic || typeof category !== "string" || typeof topic !== "string") return;

      const user = await authService.getCurrentUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      // Get user's current level
      const profile = await userService.getUserProfile(user.id);
      if (!profile) {
        router.push("/level-selection");
        return;
      }

      setUserLevel(profile.current_level);

      // Fetch questions for this topic
      const questionData = await practiceService.getQuestions(
        profile.current_level,
        category,
        decodeURIComponent(topic),
        20
      );
      
      setQuestions(questionData);
      setAnsweredQuestions(new Array(questionData.length).fill(false));
      setCorrectAnswers(new Array(questionData.length).fill(false));
      setLoading(false);
    };

    loadQuestions();
  }, [category, topic, router]);

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
    if (userId && userLevel && category && topic) {
      await practiceService.saveAnswer({
        user_id: userId,
        level: userLevel,
        category: category as string,
        group_name: decodeURIComponent(topic as string),
        question_id: currentQuestion.id,
        is_correct: correct
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
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No questions available</h3>
            <p className="text-muted-foreground mb-4">
              There are no questions available for this topic yet.
            </p>
            <Link href={`/practice/${category}`}>
              <Button>Back to Topics</Button>
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const categoryName = category ? categoryNames[category as string] || category : "";
  const topicName = topic ? decodeURIComponent(topic as string) : "";
  const score = correctAnswers.filter(Boolean).length;
  const percentage = Math.round((score / questions.length) * 100);

  // Results Screen
  if (showResults) {
    return (
      <AppLayout>
        <SEO 
          title={`Results - ${categoryName} Practice - Master JLPT`}
          description="Practice session results"
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
          <Card className="p-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
              <p className="text-muted-foreground mb-8">Great work completing this practice session</p>
              
              {/* Score Display */}
              <div className="mb-8">
                <div className="text-6xl font-bold text-primary mb-2">
                  {score}/{questions.length}
                </div>
                <div className="text-2xl text-muted-foreground">
                  {percentage}% Correct
                </div>
              </div>

              {/* Performance Message */}
              <div className="mb-8 p-4 bg-muted rounded-lg">
                {percentage >= 80 && (
                  <p className="text-lg">
                    Excellent work! You&apos;re mastering this topic! 🎉
                  </p>
                )}
                {percentage >= 60 && percentage < 80 && (
                  <p className="text-lg">
                    Good job! Keep practicing to improve further. 💪
                  </p>
                )}
                {percentage < 60 && (
                  <p className="text-lg">
                    Keep practicing! Review the explanations to strengthen your understanding. 📚
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handlePracticeAgain}
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  Practice Again
                </Button>
                <Link href={`/practice/${category}`}>
                  <Button variant="outline" size="lg">
                    Choose Another Topic
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
        title={`${topicName} - ${categoryName} Practice - Master JLPT`}
        description={`Practice ${categoryName} questions for ${topicName}`}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">
            Practice
          </Link>
          <span>/</span>
          <Link href={`/practice/${category}`} className="hover:text-foreground">
            {categoryName}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{topicName}</span>
        </div>

        {/* Header with Back Button */}
        <div className="mb-6">
          <Link href={`/practice/${category}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Topics
            </Button>
          </Link>
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
          {/* Example Sentence (if exists) */}
          {currentQuestion.example_sentence && (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Context:</p>
              <p className="text-base">{currentQuestion.example_sentence}</p>
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
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
              <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
            </div>
          )}

          {/* Next Button */}
          {hasAnswered && (
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-primary hover:bg-primary/90"
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