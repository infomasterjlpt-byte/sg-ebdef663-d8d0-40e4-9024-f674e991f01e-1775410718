import { useRouter } from "next/router";
import { AppLayout } from "@/components/Layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const LEVEL_COLORS: { [key: string]: string } = {
  N5: "#22c55e", N4: "#14b8a6", N3: "#8b5cf6", N2: "#f59e0b", N1: "#991b1b",
};

export default function MockTestResults() {
  const router = useRouter();
  const { score, total, time, level } = router.query;

  const scoreNum = parseInt(score as string) || 0;
  const totalNum = parseInt(total as string) || 60;
  const timeNum = parseInt(time as string) || 0;
  const levelStr = (level as string) || "N5";
  const percentage = Math.round((scoreNum / totalNum) * 100);
  const levelColor = LEVEL_COLORS[levelStr] || "#22c55e";

  const minutes = Math.floor(timeNum / 60);
  const seconds = timeNum % 60;

  let emoji = "😢"; let message = "Keep studying!";
  if (percentage >= 80) { emoji = "🎉"; message = "Excellent work!"; }
  else if (percentage >= 60) { emoji = "🙂"; message = "Good effort!"; }
  else if (percentage >= 40) { emoji = "📚"; message = "Keep practicing!"; }

  return (
    <>
      <SEO title="Mock Test Results - Master JLPT" description="Your mock test results" />
      <AppLayout>
        <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
          <Card>
            <CardContent className="p-6 sm:p-10 text-center space-y-6">
              <Badge style={{ backgroundColor: levelColor, color: 'white', fontSize: '16px', padding: '6px 16px' }}>
                {levelStr} Mock Test Complete
              </Badge>

              <div>
                <div className="text-6xl mb-3">{emoji}</div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-1">{message}</h1>
                <p className="text-muted-foreground">Here's how you did</p>
              </div>

              {/* Score */}
              <div style={{ background: '#f8f8f8', borderRadius: '16px', padding: '24px' }}>
                <div className="text-6xl font-bold mb-1" style={{ color: levelColor }}>{percentage}%</div>
                <p className="text-lg text-gray-600">{scoreNum} / {totalNum} correct</p>
                <p className="text-sm text-gray-400 mt-1">Time: {minutes}m {seconds}s</p>
              </div>

              {/* Feedback */}
              <div style={{ background: percentage >= 60 ? '#f0fdf4' : '#fff8e6', border: `1px solid ${percentage >= 60 ? '#86efac' : '#f59e0b'}`, borderRadius: '8px', padding: '16px', fontSize: '14px', color: percentage >= 60 ? '#166534' : '#92400e' }}>
                {percentage >= 80 && "Outstanding! You're well prepared for this level."}
                {percentage >= 60 && percentage < 80 && "Good progress! Focus on your weak areas and keep practicing."}
                {percentage < 60 && "Don't give up! Regular practice will improve your score. Review the categories you struggled with."}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => router.push("/mock-test")} className="bg-[#cc1f1f] hover:bg-[#b01b1b] text-white" size="lg">
                  Take Another Test
                </Button>
                <Link href="/practice">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">Practice More</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}
