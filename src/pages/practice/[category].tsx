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
import { practiceService, type TopicSummary } from "@/services/practiceService";
import { ArrowLeft, BookOpen } from "lucide-react";

const categoryNames: Record<string, string> = {
  kanji: "Kanji",
  grammar: "Grammar",
  reading: "Reading"
};

export default function CategoryTopicsPage() {
  const router = useRouter();
  const { category } = router.query;
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTopics = async () => {
      if (!category || typeof category !== "string") return;

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

      // Fetch topics for this category
      const topicData = await practiceService.getTopics(
        user.id,
        profile.current_level,
        category
      );
      
      setTopics(topicData);
      setLoading(false);
    };

    loadTopics();
  }, [category, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading topics...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const categoryName = category ? categoryNames[category as string] || category : "";

  return (
    <AppLayout>
      <SEO 
        title={`${categoryName} Practice - Master JLPT`}
        description={`Practice ${categoryName} questions for JLPT ${userLevel?.toUpperCase()}`}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/practice" className="hover:text-foreground">
            Practice
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryName}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/practice">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{categoryName} Topics</h1>
          {userLevel && (
            <p className="text-lg text-muted-foreground mt-2">
              Level: <span className="font-semibold text-foreground">{userLevel.toUpperCase()}</span>
            </p>
          )}
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No topics available</h3>
            <p className="text-muted-foreground">
              There are no practice topics available for this category yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => {
              const progress = topic.total > 0 ? (topic.answered / topic.total) * 100 : 0;
              
              return (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{topic.group}</h3>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm text-muted-foreground">
                          {topic.total} questions
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {topic.answered} / {topic.total} answered
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    
                    <Link href={`/practice/${category}/${encodeURIComponent(topic.group)}`}>
                      <Button className="bg-primary hover:bg-primary/90">
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