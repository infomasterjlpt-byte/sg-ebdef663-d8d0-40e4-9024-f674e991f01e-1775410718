import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { updateUserProfile } from "@/services/userService";
import { User, Target, Award, LogOut } from "lucide-react";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [targetLevel, setTargetLevel] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (profile) {
      setUserProfile(profile);
      setTargetLevel(profile.target_level || "");
      setDailyGoal(profile.daily_goal?.toString() || "20");
    }
  }

  async function handleSave() {
    if (!user) return;

    setLoading(true);
    await updateUserProfile(user.id, {
      target_level: targetLevel,
      daily_goal: parseInt(dailyGoal),
    });

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    setLoading(false);
    alert("Settings saved successfully!");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (!user || !userProfile) {
    return null;
  }

  return (
    <>
      <SEO title="Settings - JLPT Master" description="Account settings" />
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent text-white">
                  <User className="h-5 w-5" />
                </div>
                <CardTitle>Profile Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subscription</label>
                <Badge variant={userProfile.is_premium ? "default" : "outline"}>
                  {userProfile.is_premium ? "Premium" : "Free"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent text-white">
                  <Target className="h-5 w-5" />
                </div>
                <CardTitle>Study Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Level</label>
                <Select value={targetLevel} onValueChange={setTargetLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N5">N5 - Beginner</SelectItem>
                    <SelectItem value="N4">N4 - Elementary</SelectItem>
                    <SelectItem value="N3">N3 - Intermediate</SelectItem>
                    <SelectItem value="N2">N2 - Advanced</SelectItem>
                    <SelectItem value="N1">N1 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Daily Goal</label>
                <Select value={dailyGoal} onValueChange={setDailyGoal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 questions/day</SelectItem>
                    <SelectItem value="20">20 questions/day</SelectItem>
                    <SelectItem value="30">30 questions/day</SelectItem>
                    <SelectItem value="50">50 questions/day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent text-white">
                  <Award className="h-5 w-5" />
                </div>
                <CardTitle>Study Stats</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{userProfile.streak || 0}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{userProfile.daily_goal || 20}</p>
                  <p className="text-sm text-muted-foreground">Daily Goal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </>
  );
}