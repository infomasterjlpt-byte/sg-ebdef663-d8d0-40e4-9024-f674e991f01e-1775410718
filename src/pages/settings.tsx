import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/Layout/AppLayout";
import { BackButton } from "@/components/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Target, LogOut, AlertTriangle } from "lucide-react";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
      setLevel(profile.level || "N5");
    }
  }

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({ level })
      .eq("id", user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setUserProfile(profile);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleCancelSubscription() {
    if (!user) return;
    setCancelLoading(true);
    setCancelMessage("");

    const res = await fetch("/api/stripe/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    const data = await res.json();

    if (res.ok) {
      setCancelMessage(data.message);
      setShowCancelConfirm(false);
      // Refresh profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) setUserProfile(profile);
    } else {
      setCancelMessage(`Error: ${data.error}`);
    }

    setCancelLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  if (!user || !userProfile) return null;

  const isPremium = userProfile.is_premium === true;

  return (
    <>
      <SEO title="Settings - Master JLPT" description="Account settings" />
      <AppLayout>
        <BackButton />
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>

          {/* Profile */}
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
                <Badge
                  variant={isPremium ? "default" : "outline"}
                  style={isPremium ? { backgroundColor: "#cc1f1f", color: "#fff" } : {}}
                >
                  {isPremium
                    ? `Premium${userProfile.subscription_type ? ` (${userProfile.subscription_type})` : ""}`
                    : "Free"}
                </Badge>
                {!isPremium && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <a href="/pricing" className="text-[#cc1f1f] hover:underline font-medium">
                      Upgrade to Premium
                    </a>{" "}
                    to unlock N4–N2 and unlimited practice.
                  </p>
                )}
              </div>

              {/* Cancel subscription — only shown to premium users */}
              {isPremium && (
                <div className="border-t pt-4 space-y-3">
                  <label className="text-sm font-medium block">Manage Subscription</label>

                  {cancelMessage && (
                    <div
                      style={{
                        background: cancelMessage.startsWith("Error") ? "#fff0f0" : "#f0fff4",
                        border: `1px solid ${cancelMessage.startsWith("Error") ? "#fca5a5" : "#86efac"}`,
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontSize: "14px",
                        color: cancelMessage.startsWith("Error") ? "#991b1b" : "#166534",
                      }}
                    >
                      {cancelMessage}
                    </div>
                  )}

                  {!showCancelConfirm ? (
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel Subscription
                    </Button>
                  ) : (
                    <div
                      style={{
                        background: "#fff8e6",
                        border: "1px solid #f59e0b",
                        borderRadius: "8px",
                        padding: "14px 16px",
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800">
                          Your subscription will be cancelled but you will keep Premium access
                          until the end of your current billing period.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleCancelSubscription}
                          disabled={cancelLoading}
                        >
                          {cancelLoading ? "Cancelling…" : "Yes, cancel it"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCancelConfirm(false)}
                          disabled={cancelLoading}
                        >
                          Keep Premium
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Study level */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent text-white">
                  <Target className="h-5 w-5" />
                </div>
                <CardTitle>Study Level</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Level</label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N5">N5 - Beginner</SelectItem>
                    <SelectItem value="N4">N4 - Elementary</SelectItem>
                    <SelectItem value="N3">N3 - Intermediate</SelectItem>
                    <SelectItem value="N2">N2 - Upper Intermediate</SelectItem>
                    <SelectItem value="N1">N1 - Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Changing level will reset your practice progress display.
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-[#cc1f1f] hover:bg-[#b01b1b] text-white"
              >
                {loading ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Sign out */}
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
