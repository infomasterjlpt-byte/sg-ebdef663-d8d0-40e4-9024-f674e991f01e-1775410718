import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Question = Tables<"questions">;
export type ReviewItem = Tables<"review_items">;
export type Result = Tables<"results">;

/**
 * Fetch questions by level and category
 */
export async function getQuestionsByLevelAndCategory(
  level: string,
  category: string,
  limit: number = 20
): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("level", level.toUpperCase())
    .eq("category", category.toLowerCase())
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch random questions for a specific level and category
 */
export async function getRandomQuestions(
  level: string,
  category: string,
  limit: number = 20
): Promise<Question[]> {
  // Fetch more questions than needed, then randomize client-side
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("level", level.toUpperCase())
    .eq("category", category.toLowerCase())
    .limit(limit * 2);

  if (error) {
    console.error("Error fetching random questions:", error);
    throw error;
  }

  // Shuffle and limit
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

/**
 * Fetch mixed questions for mock test with JLPT proportions
 * Kanji: 35%, Grammar: 35%, Reading: 30%
 */
export async function getMockTestQuestions(
  level: string,
  totalQuestions: number = 60
): Promise<Question[]> {
  const kanjiCount = Math.floor(totalQuestions * 0.35);
  const grammarCount = Math.floor(totalQuestions * 0.35);
  const readingCount = totalQuestions - kanjiCount - grammarCount;

  const [kanji, grammar, reading] = await Promise.all([
    getRandomQuestions(level, "kanji", kanjiCount),
    getRandomQuestions(level, "grammar", grammarCount),
    getRandomQuestions(level, "reading", readingCount),
  ]);

  // Combine and shuffle
  const allQuestions = [...kanji, ...grammar, ...reading];
  return allQuestions.sort(() => Math.random() - 0.5);
}

/**
 * Save question result
 */
export async function saveQuestionResult(
  userId: string,
  questionId: string,
  correct: boolean,
  mode: string
): Promise<void> {
  const { error } = await supabase.from("results").insert({
    user_id: userId,
    question_id: questionId,
    correct,
    mode,
  });

  if (error) {
    console.error("Error saving result:", error);
    throw error;
  }
}

/**
 * Add question to review items if answered incorrectly
 */
export async function addToReview(
  userId: string,
  questionId: string
): Promise<void> {
  // Check if already exists
  const { data: existing } = await supabase
    .from("review_items")
    .select("id")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .single();

  if (existing) {
    // Update last_reviewed_at
    const { error } = await supabase
      .from("review_items")
      .update({ last_reviewed_at: new Date().toISOString() })
      .eq("id", existing.id);

    if (error) console.error("Error updating review item:", error);
    return;
  }

  // Insert new review item
  const { error } = await supabase.from("review_items").insert({
    user_id: userId,
    question_id: questionId,
    status: "learning",
    correct_streak: 0,
  });

  if (error) {
    console.error("Error adding to review:", error);
    throw error;
  }
}

/**
 * Get review questions for a user
 */
export async function getReviewQuestions(
  userId: string,
  limit: number = 20
): Promise<Question[]> {
  const { data: reviewItems, error: reviewError } = await supabase
    .from("review_items")
    .select("question_id")
    .eq("user_id", userId)
    .eq("status", "learning")
    .order("last_reviewed_at", { ascending: true })
    .limit(limit);

  if (reviewError) {
    console.error("Error fetching review items:", reviewError);
    throw reviewError;
  }

  if (!reviewItems || reviewItems.length === 0) {
    return [];
  }

  const questionIds = reviewItems.map((item) => item.question_id);

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .in("id", questionIds);

  if (questionsError) {
    console.error("Error fetching review questions:", questionsError);
    throw questionsError;
  }

  return questions || [];
}

/**
 * Update review item when answered correctly
 */
export async function updateReviewItem(
  userId: string,
  questionId: string,
  correct: boolean
): Promise<void> {
  const { data: reviewItem, error: fetchError } = await supabase
    .from("review_items")
    .select("*")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .single();

  if (fetchError || !reviewItem) {
    console.error("Review item not found");
    return;
  }

  const newStreak = correct ? reviewItem.correct_streak + 1 : 0;
  const newStatus = newStreak >= 3 ? "mastered" : "learning";

  const { error } = await supabase
    .from("review_items")
    .update({
      correct_streak: newStreak,
      status: newStatus,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", reviewItem.id);

  if (error) {
    console.error("Error updating review item:", error);
    throw error;
  }
}

/**
 * Get daily practice questions (10 random from user's level)
 */
export async function getDailyPracticeQuestions(
  level: string
): Promise<Question[]> {
  // Get 10 random questions across all categories
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("level", level.toUpperCase())
    .limit(30); // Fetch more for better randomization

  if (error) {
    console.error("Error fetching daily questions:", error);
    throw error;
  }

  // Shuffle and return 10
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}

/**
 * Update daily progress
 */
export async function updateDailyProgress(
  userId: string,
  questionsAnswered: number
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  // Check if record exists for today
  const { data: existing } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  // Get user's daily goal
  const { data: userData } = await supabase
    .from("users")
    .select("daily_goal")
    .eq("id", userId)
    .single();

  const dailyGoal = userData?.daily_goal || 20;
  const totalAnswered = existing
    ? existing.questions_answered + questionsAnswered
    : questionsAnswered;
  const goalMet = totalAnswered >= dailyGoal;

  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from("daily_progress")
      .update({
        questions_answered: totalAnswered,
        goal_met: goalMet,
      })
      .eq("id", existing.id);

    if (error) console.error("Error updating daily progress:", error);
  } else {
    // Create new record
    const { error } = await supabase.from("daily_progress").insert({
      user_id: userId,
      date: today,
      questions_answered: totalAnswered,
      goal_met: goalMet,
    });

    if (error) console.error("Error creating daily progress:", error);
  }
}

/**
 * Save mock test result
 */
export async function saveMockTestResult(
  userId: string,
  level: string,
  score: number,
  totalQuestions: number,
  timeTaken: number,
  sections: any
): Promise<void> {
  const { error } = await supabase.from("mock_tests").insert({
    user_id: userId,
    level,
    score,
    total_questions: totalQuestions,
    time_taken: timeTaken,
    sections,
  });

  if (error) {
    console.error("Error saving mock test:", error);
    throw error;
  }
}