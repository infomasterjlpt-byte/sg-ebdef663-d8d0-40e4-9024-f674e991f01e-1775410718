import { supabase } from "@/integrations/supabase/client";

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return { data, error };
}

export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

export async function updateUserLevel(userId: string, level: string) {
  return updateUserProfile(userId, { target_level: level });
}

export async function updateDailyGoal(userId: string, goal: number) {
  return updateUserProfile(userId, { daily_goal: goal });
}

export async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  
  const { data: user } = await getUserProfile(userId);
  if (!user) return;

  const lastStudyDate = user.last_study_date;
  let newStreak = user.streak || 0;

  if (lastStudyDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastStudyDate === yesterdayStr) {
      newStreak += 1;
    } else if (lastStudyDate !== today) {
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  return updateUserProfile(userId, {
    streak: newStreak,
    last_study_date: today,
  });
}