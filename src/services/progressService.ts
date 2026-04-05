import { supabase } from "@/integrations/supabase/client";

export async function updateDailyProgress(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  const questionsAnswered = (existing?.questions_answered || 0) + 1;

  const { data: user } = await supabase
    .from("users")
    .select("daily_goal")
    .eq("id", userId)
    .single();

  const goalMet = questionsAnswered >= (user?.daily_goal || 20);

  if (existing) {
    await supabase
      .from("daily_progress")
      .update({ questions_answered: questionsAnswered, goal_met: goalMet })
      .eq("id", existing.id);
  } else {
    await supabase.from("daily_progress").insert({
      user_id: userId,
      date: today,
      questions_answered: questionsAnswered,
      goal_met: goalMet,
    });
  }
}

export async function getTodayProgress(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single();

  return { data, error };
}

export async function getUserStats(userId: string, level: string) {
  const { data: results } = await supabase
    .from("results")
    .select("*, questions(*)")
    .eq("user_id", userId);

  const levelResults = results?.filter((r: any) => r.questions?.level === level) || [];
  const totalQuestions = levelResults.length;
  const correctAnswers = levelResults.filter((r: any) => r.correct).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const categories = ["kanji", "grammar", "vocabulary", "reading"];
  const categoryStats: any = {};

  categories.forEach((cat) => {
    const catResults = levelResults.filter((r: any) => r.questions?.category === cat);
    const catCorrect = catResults.filter((r: any) => r.correct).length;
    categoryStats[cat] = {
      total: catResults.length,
      correct: catCorrect,
      accuracy: catResults.length > 0 ? (catCorrect / catResults.length) * 100 : 0,
    };
  });

  const { data: reviewItems } = await supabase
    .from("review_items")
    .select("*, questions(*)")
    .eq("user_id", userId);

  const levelReviewItems = reviewItems?.filter((r: any) => r.questions?.level === level) || [];

  const mastered = levelReviewItems.filter((r: any) => r.status === "mastered").length;
  const hard = levelReviewItems.filter((r: any) => r.status === "hard").length;
  const learning = levelReviewItems.filter((r: any) => r.status === "learning").length;

  return {
    accuracy,
    totalQuestions,
    categoryStats,
    mastered,
    hard,
    learning,
  };
}

export async function getProgressStats(userId: string, level: string) {
  return getUserStats(userId, level);
}