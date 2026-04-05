import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen } from "lucide-react";

const N5_GRAMMAR = [
  {
    point: "は (wa) - Topic Marker",
    explanation: "Used to mark the topic of a sentence. Shows what you're talking about.",
    examples: [
      "私は学生です。(Watashi wa gakusei desu.) - I am a student.",
      "これは本です。(Kore wa hon desu.) - This is a book."
    ]
  },
  {
    point: "が (ga) - Subject Marker",
    explanation: "Marks the grammatical subject. Often used when introducing new information.",
    examples: [
      "猫がいます。(Neko ga imasu.) - There is a cat.",
      "誰がきましたか。(Dare ga kimashita ka.) - Who came?"
    ]
  },
  {
    point: "を (wo) - Direct Object Marker",
    explanation: "Marks the direct object of an action verb.",
    examples: [
      "りんごを食べます。(Ringo wo tabemasu.) - I eat an apple.",
      "本を読みます。(Hon wo yomimasu.) - I read a book."
    ]
  },
  {
    point: "に (ni) - Location/Time/Direction",
    explanation: "Indicates location of existence, time, or direction of movement.",
    examples: [
      "学校に行きます。(Gakkou ni ikimasu.) - I go to school.",
      "東京にいます。(Tokyo ni imasu.) - I am in Tokyo."
    ]
  },
  {
    point: "で (de) - Location of Action/Means",
    explanation: "Shows where an action takes place or the means by which something is done.",
    examples: [
      "図書館で勉強します。(Toshokan de benkyou shimasu.) - I study at the library.",
      "バスで行きます。(Basu de ikimasu.) - I go by bus."
    ]
  },
  {
    point: "と (to) - And/With",
    explanation: "Connects nouns (and) or indicates accompaniment (with).",
    examples: [
      "田中さんと山田さん (Tanaka-san to Yamada-san) - Mr. Tanaka and Mr. Yamada",
      "友達と映画を見ます。(Tomodachi to eiga wo mimasu.) - I watch a movie with friends."
    ]
  },
  {
    point: "の (no) - Possessive/Modification",
    explanation: "Shows possession or modifies nouns.",
    examples: [
      "私の本 (Watashi no hon) - My book",
      "日本の文化 (Nihon no bunka) - Japanese culture"
    ]
  },
  {
    point: "も (mo) - Also/Too",
    explanation: "Means 'also' or 'too'. Replaces は, が, or を.",
    examples: [
      "私も学生です。(Watashi mo gakusei desu.) - I am also a student.",
      "これも本です。(Kore mo hon desu.) - This is also a book."
    ]
  },
  {
    point: "か (ka) - Question Marker",
    explanation: "Placed at the end of a sentence to make it a question.",
    examples: [
      "学生ですか。(Gakusei desu ka.) - Are you a student?",
      "何時ですか。(Nanji desu ka.) - What time is it?"
    ]
  },
  {
    point: "ね (ne) - Confirmation/Agreement",
    explanation: "Seeks confirmation or agreement, like 'right?' or 'isn't it?'",
    examples: [
      "いい天気ですね。(Ii tenki desu ne.) - Nice weather, isn't it?",
      "おいしいですね。(Oishii desu ne.) - It's delicious, right?"
    ]
  }
];

export default function GrammarGuide() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

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

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
  }

  return (
    <>
      <SEO title="Grammar Guide - JLPT Master" description="Comprehensive Japanese grammar reference" />
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Grammar Guide</h1>
            <p className="text-muted-foreground">
              Essential Japanese grammar points with examples
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-level-n5 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>N5 Grammar Points</CardTitle>
                  <p className="text-sm text-muted-foreground">Beginner level essentials</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {N5_GRAMMAR.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {index + 1}
                        </Badge>
                        <span className="font-semibold">{item.point}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <p className="text-muted-foreground">{item.explanation}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Examples:</p>
                          {item.examples.map((example, idx) => (
                            <div key={idx} className="pl-4 border-l-2 border-accent">
                              <p className="text-sm">{example}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {!userProfile?.is_premium && (
            <Card className="bg-accent/5 border-accent">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="font-semibold">Unlock All Grammar Guides</h3>
                  <p className="text-sm text-muted-foreground">
                    Get access to N4, N3, N2, and N1 grammar points with Premium
                  </p>
                  <button
                    onClick={() => router.push("/pricing")}
                    className="text-accent hover:underline text-sm font-medium"
                  >
                    Upgrade to Premium →
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </>
  );
}