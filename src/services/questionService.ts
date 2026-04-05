import { supabase } from "@/integrations/supabase/client";

export async function getQuestionsByLevel(level: string, category?: string, limit = 10) {
  let query = supabase
    .from("questions")
    .select("*")
    .eq("level", level);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.limit(limit);

  return { data: data || [], error };
}

export async function getRandomQuestions(level: string, category: string, count: number) {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("level", level)
    .eq("category", category)
    .limit(count * 3);

  if (error || !data) return { data: [], error };

  const shuffled = data.sort(() => Math.random() - 0.5);
  return { data: shuffled.slice(0, count), error: null };
}

export async function submitAnswer(
  userId: string,
  questionId: string,
  correct: boolean,
  mode: string
) {
  const { error: resultError } = await supabase.from("results").insert({
    user_id: userId,
    question_id: questionId,
    correct,
    mode,
  });

  if (resultError) return { error: resultError };

  if (!correct) {
    const { data: existing } = await supabase
      .from("review_items")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .single();

    if (existing) {
      await supabase
        .from("review_items")
        .update({
          correct_streak: 0,
          status: existing.correct_streak === 0 ? "hard" : "learning",
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("review_items").insert({
        user_id: userId,
        question_id: questionId,
        status: "learning",
        correct_streak: 0,
      });
    }
  } else {
    const { data: existing } = await supabase
      .from("review_items")
      .select("*")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .single();

    if (existing) {
      const newStreak = existing.correct_streak + 1;
      const newStatus = newStreak >= 2 ? "mastered" : newStreak === 1 ? "hard" : "learning";

      await supabase
        .from("review_items")
        .update({
          correct_streak: newStreak,
          status: newStatus,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    }
  }

  return { error: null };
}