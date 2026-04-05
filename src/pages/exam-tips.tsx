import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, Clock, Target, BookOpen, FileText } from "lucide-react";

const EXAM_TIPS = [
  {
    title: "Time Management",
    icon: Clock,
    tips: [
      "Practice with a timer before the actual exam to build speed and accuracy",
      "Allocate time per section: don't spend too long on difficult questions",
      "If stuck on a question, mark it and move on — come back if time permits",
      "Use the last 5 minutes to review answers and fill in any blanks",
      "For reading passages, skim first to get the main idea, then answer questions"
    ]
  },
  {
    title: "Vocabulary Section Strategy",
    icon: BookOpen,
    tips: [
      "Read the entire sentence before looking at options",
      "Look for context clues in surrounding words",
      "Eliminate obviously wrong answers first",
      "Pay attention to kanji readings — some options may have the same meaning but different pronunciation",
      "If unsure, choose the most common/natural-sounding option"
    ]
  },
  {
    title: "Grammar Section Strategy",
    icon: FileText,
    tips: [
      "Identify the grammar point being tested (particle, verb form, expression)",
      "Check if the sentence needs a connector, particle, or verb conjugation",
      "Watch for negative forms and tense markers",
      "Some questions test word order — reconstruct the sentence logically",
      "Memorize common grammar patterns for your level"
    ]
  },
  {
    title: "Reading Comprehension Strategy",
    icon: Target,
    tips: [
      "Read the questions first to know what to look for",
      "Underline key information as you read the passage",
      "Don't translate word-for-word — focus on overall meaning",
      "Pay attention to transition words (でも, しかし, そして)",
      "Main idea questions: look at the first and last sentences of paragraphs",
      "Detail questions: scan the passage for specific keywords from the question"
    ]
  },
  {
    title: "Test Day Tips",
    icon: Lightbulb,
    tips: [
      "Get a full night's sleep before the exam",
      "Arrive 30 minutes early to avoid stress",
      "Bring your test voucher, ID, pencils, eraser, and a watch",
      "Stay calm — if you've studied consistently, you're prepared",
      "Fill in all answers even if you're guessing (no penalty for wrong answers)",
      "Trust your first instinct — don't second-guess too much",
      "Take deep breaths between sections to stay focused"
    ]
  }
];

export default function ExamTips() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUser(user);
  }

  return (
    <>
      <SEO title="Exam Tips - JLPT Master" description="JLPT test-taking strategies" />
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Exam Tips</h1>
            <p className="text-muted-foreground">
              Test-taking strategies to maximize your JLPT score
            </p>
          </div>

          <div className="space-y-6">
            {EXAM_TIPS.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex gap-3">
                          <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                            {tipIndex + 1}
                          </Badge>
                          <p className="text-sm text-muted-foreground">{tip}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-accent/5 border-accent">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold">Ready to Practice?</h3>
                <p className="text-sm text-muted-foreground">
                  Apply these strategies in practice mode and mock tests
                </p>
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={() => router.push("/practice")}
                    className="text-accent hover:underline text-sm font-medium"
                  >
                    Start Practice →
                  </button>
                  <button
                    onClick={() => router.push("/mock-test")}
                    className="text-accent hover:underline text-sm font-medium"
                  >
                    Take Mock Test →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}