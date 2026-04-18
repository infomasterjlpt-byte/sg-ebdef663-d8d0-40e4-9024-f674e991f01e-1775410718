import { supabase } from "@/integrations/supabase/client";

export const userService = {
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    return { data, error };
  },

  async updateUserLevel(userId: string, level: string) {
    return this.updateUserProfile(userId, { target_level: level });
  },

  async updateDailyGoal(userId: string, goal: number) {
    return this.updateUserProfile(userId, { daily_goal: goal });
  },

  async updateStreak(userId: string) {
    const today = new Date().toISOString().split("T")[0];
    
    const user = await this.getUserProfile(userId);
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

    return this.updateUserProfile(userId, {
      streak: newStreak,
      last_study_date: today,
    });
  }
};