import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";

const LEVEL_DATA = [
  {
    level: "N5",
    difficulty: "Beginner",
    kanji: 100,
    vocabulary: 800,
    grammar: 285,
    reading: 212,
    total: 997,
    color: "bg-level-n5",
  },
  {
    level: "N4",
    difficulty: "Elementary",
    kanji: 300,
    vocabulary: 1500,
    grammar: 300,
    reading: 250,
    total: 2350,
    color: "bg-level-n4",
  },
  {
    level: "N3",
    difficulty: "Intermediate",
    kanji: 650,
    vocabulary: 3700,
    grammar: 350,
    reading: 300,
    total: 5000,
    color: "bg-level-n3",
  },
  {
    level: "N2",
    difficulty: "Upper Intermediate",
    kanji: 1000,
    vocabulary: 6000,
    grammar: 400,
    reading: 350,
    total: 7750,
    color: "bg-level-n2",
  },
  {
    level: "N1",
    difficulty: "Advanced",
    kanji: 2000,
    vocabulary: 10000,
    grammar: 450,
    reading: 400,
    total: 12850,
    color: "bg-level-n1",
  },
];

export default function LevelSelection() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUser(user);
  }

  async function handleConfirm() {
    if (!selectedLevel || !user) return;

    setLoading(true);

    const { error } = await supabase
      .from("users")
      .update({ target_level: selectedLevel })
      .eq("id", user.id);

    if (!error) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Select Your Level - JLPT Master" description="Choose your target JLPT level" />
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Choose Your Target Level</h1>
            <p className="text-muted-foreground">
              Select the JLPT level you're preparing for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {LEVEL_DATA.map((levelData) => {
              const isSelected = selectedLevel === levelData.level;

              return (
                <Card
                  key={levelData.level}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedLevel(levelData.level)}
                >
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <Badge className={`${levelData.color} text-white`}>
                        {levelData.level}
                      </Badge>
                      {isSelected && (
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl">{levelData.difficulty}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kanji:</span>
                        <span className="font-medium">{levelData.kanji.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vocabulary:</span>
                        <span className="font-medium">{levelData.vocabulary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grammar:</span>
                        <span className="font-medium">{levelData.grammar}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reading:</span>
                        <span className="font-medium">{levelData.reading}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="font-semibold">Total Questions:</span>
                        <span className="font-bold text-primary">
                          {levelData.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={!selectedLevel || loading}
              className="min-w-48"
            >
              {loading ? "Saving..." : "Confirm Selection"}
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              You can change your target level anytime from Account Settings
            </p>
          </div>
        </div>
      </div>
    </>
  );
}