import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface TopicSummary {
  group: string;
  total: number;
  answered: number;
}

export interface PracticeQuestion {
  id: string;
  level: string;
  category: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string | null;
  example_sentence: string | null;
}

export interface PracticeSession {
  user_id: string;
  level: string;
  category: string;
  group_name: string;
  question_id: string;
  is_correct: boolean;
}

export const practiceService = {
  // Get topics for a category with progress
  async getTopics(userId: string, level: string, category: string): Promise<TopicSummary[]> {
    try {
      // Get all topics with question counts
      const { data: questions, error: questionsError } = await supabase
        .from("questions")
        .select("id")
        .eq("level", level)
        .eq("category", category);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return [];
      }

      // Group questions by their group (we need to query jlpt_questions for group info)
      const { data: jlptQuestions, error: jlptError } = await supabase
        .from("jlpt_questions")
        .select("id, group")
        .eq("level", level)
        .eq("type", category);

      if (jlptError) {
        console.error("Error fetching JLPT questions:", jlptError);
        return [];
      }

      // Get user's practice sessions for this category
      const { data: sessions, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("question_id, group_name")
        .eq("user_id", userId)
        .eq("level", level)
        .eq("category", category);

      if (sessionsError) {
        console.error("Error fetching practice sessions:", sessionsError);
      }

      // Group by topic
      const topicMap: Record<string, { total: number; answered: Set<string> }> = {};

      jlptQuestions?.forEach((q) => {
        const group = q.group || "Ungrouped";
        if (!topicMap[group]) {
          topicMap[group] = { total: 0, answered: new Set() };
        }
        topicMap[group].total++;
      });

      // Add answered count
      sessions?.forEach((session) => {
        const group = session.group_name;
        if (topicMap[group]) {
          topicMap[group].answered.add(session.question_id);
        }
      });

      // Convert to array
      return Object.entries(topicMap).map(([group, data]) => ({
        group,
        total: data.total,
        answered: data.answered.size
      })).sort((a, b) => a.group.localeCompare(b.group));

    } catch (error) {
      console.error("Error in getTopics:", error);
      return [];
    }
  },

  // Get random questions for practice
  async getQuestions(level: string, category: string, topic: string, limit: number = 20): Promise<PracticeQuestion[]> {
    try {
      // First get questions from jlpt_questions table
      const { data: jlptQuestions, error } = await supabase
        .from("jlpt_questions")
        .select("*")
        .eq("level", level)
        .eq("type", category)
        .eq("group", topic)
        .limit(limit);

      if (error) {
        console.error("Error fetching practice questions:", error);
        return [];
      }

      // Map to PracticeQuestion format
      const questions: PracticeQuestion[] = (jlptQuestions || []).map(q => ({
        id: q.id,
        level: q.level || level,
        category: q.type || category,
        question: q.question || "",
        options: Array.isArray(q.options) ? q.options : [],
        answer_index: q.answer || 0,
        explanation: q.explanation,
        example_sentence: q.passage
      }));

      // Shuffle questions
      return questions.sort(() => Math.random() - 0.5).slice(0, limit);

    } catch (error) {
      console.error("Error in getQuestions:", error);
      return [];
    }
  },

  // Save practice session result
  async saveAnswer(session: PracticeSession): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("practice_sessions")
        .insert({
          user_id: session.user_id,
          level: session.level,
          category: session.category,
          group_name: session.group_name,
          question_id: session.question_id,
          is_correct: session.is_correct
        });

      if (error) {
        console.error("Error saving practice answer:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in saveAnswer:", error);
      return false;
    }
  },

  // Get user's progress for a specific topic
  async getTopicProgress(userId: string, level: string, category: string, topic: string): Promise<{
    total: number;
    answered: number;
    correct: number;
  }> {
    try {
      // Get total questions in topic
      const { data: questions, error: questionsError } = await supabase
        .from("jlpt_questions")
        .select("id")
        .eq("level", level)
        .eq("type", category)
        .eq("group", topic);

      if (questionsError) {
        console.error("Error fetching questions:", questionsError);
        return { total: 0, answered: 0, correct: 0 };
      }

      // Get user's sessions for this topic
      const { data: sessions, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("question_id, is_correct")
        .eq("user_id", userId)
        .eq("level", level)
        .eq("category", category)
        .eq("group_name", topic);

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError);
        return { total: questions?.length || 0, answered: 0, correct: 0 };
      }

      const uniqueAnswered = new Set(sessions?.map(s => s.question_id) || []);
      const correctCount = sessions?.filter(s => s.is_correct).length || 0;

      return {
        total: questions?.length || 0,
        answered: uniqueAnswered.size,
        correct: correctCount
      };

    } catch (error) {
      console.error("Error in getTopicProgress:", error);
      return { total: 0, answered: 0, correct: 0 };
    }
  }
};