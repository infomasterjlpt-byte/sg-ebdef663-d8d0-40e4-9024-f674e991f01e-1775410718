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
import { BookOpen, ArrowRight } from "lucide-react";

interface GroupData {
  group: string;
  total: number;
  answered: number;
}

export default function N5KanjiGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      const user = await authService.getCurrentUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      // Fetch groups from questions table
      const { data: groupData, error: groupError } = await supabase
        .from("questions")
       .select("group, level, category")
        .eq("level", "N5")
        .eq("category", "kanji");

      if (groupError) {
        console.error("Error fetching groups:", groupError);
        setLoading(false);
        return;
      }
      console.log("Group data received:", groupData);

      // Group and count questions
      const groupMap: Record<string, number> = {};
      groupData?.forEach((item) => {
       const groupName = (item as any).group || "Ungrouped";
        groupMap[groupName] = (groupMap[groupName] || 0) + 1;
      });

      // Fetch user's progress for each group
      const { data: progressData, error: progressError } = await supabase
        .from("practice_sessions")
        .select("group_name, question_id, is_correct")
        .eq("user_id", user.id)
        .eq("level", "N5")
        .eq("category", "kanji");

      if (progressError) {
        console.error("Error fetching progress:", progressError);
      }

      // Calculate answered count for each group (unique questions answered correctly)
      const progressMap: Record<string, Set<string>> = {};
      progressData?.forEach((session) => {
        if (session.is_correct) {
          if (!progressMap[session.group_name]) {
            progressMap[session.group_name] = new Set();
          }
          progressMap[session.group_name].add(session.question_id);
        }
      });

      // Combine data
      const groupsArray = Object.entries(groupMap).map(([group, total]) => ({
        group,
        total,
        answered: progressMap[group]?.size || 0
      })).sort((a, b) => a.group.localeCompare(b.group));

      setGroups(groupsArray);
      setLoading(false);
    };

    loadGroups();
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading groups...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <SEO 
        title="N5 Kanji Practice - Master JLPT"
        description="Practice N5 Kanji questions grouped by topic"
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">
            Practice
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">N5</span>
          <span>/</span>
          <span className="text-foreground font-medium">Kanji</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">N5 Kanji Groups</h1>
          <p className="text-lg text-muted-foreground">
            Select a group to start practicing
          </p>
        </div>

        {/* Groups List */}
        {groups.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No groups available</h3>
            <p className="text-muted-foreground">
              There are no kanji groups available for N5 yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const progress = group.total > 0 ? (group.answered / group.total) * 100 : 0;
              
              return (
                <Card key={group.group} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{group.group}</h3>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-muted-foreground">
                          {group.total} questions
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {group.answered} / {group.total} correct
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <Link href={`/practice/n5/kanji/${encodeURIComponent(group.group)}`}>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Start
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
