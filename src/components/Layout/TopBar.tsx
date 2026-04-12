import Link from "next/link";
import { useRouter } from "next/router";
import { Moon, Sun, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";
import { LevelChangeModal } from "@/components/LevelChangeModal";

const LEVEL_COLORS: { [key: string]: string } = {
  N5: "bg-green-500",
  N4: "bg-cyan-500",
  N3: "bg-purple-500",
  N2: "bg-amber-500",
  N1: "bg-red-500",
};

export function TopBar() {
  const router = useRouter();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }

    loadUserData();
  }, []);

  async function loadUserData() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();
      
      setUserProfile(userData);
      setIsPremium(userData?.is_premium || false);
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLevelChanged = () => {
    loadUserData();
    router.reload();
  };

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Master JLPT" 
                style={{ height: '40px', width: 'auto' }}
              />
            </Link>

            <div className="flex items-center gap-3">
              <Select value={currency} onValueChange={(val) => setCurrency(val as any)}>
                <SelectTrigger className="w-[100px] h-9">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JPY">¥ JPY</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                  <SelectItem value="BDT">৳ BDT</SelectItem>
                  <SelectItem value="NPR">₨ NPR</SelectItem>
                  <SelectItem value="INR">₹ INR</SelectItem>
                  <SelectItem value="VND">₫ VND</SelectItem>
                  <SelectItem value="LKR">රු LKR</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>

              {isPremium && (
                <Badge className="bg-primary text-primary-foreground">Premium</Badge>
              )}

              {user && userProfile?.target_level && (
                <Badge 
                  className={`${LEVEL_COLORS[userProfile.target_level]} text-white cursor-pointer hover:opacity-90`}
                  onClick={() => setShowLevelModal(true)}
                >
                  {userProfile.target_level}
                </Badge>
              )}

              {user && (
                <>
                  <Avatar className="h-9 w-9 cursor-pointer" onClick={() => router.push("/settings")}>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="rounded-full"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {user && userProfile && (
        <LevelChangeModal
          open={showLevelModal}
          onOpenChange={setShowLevelModal}
          currentLevel={userProfile.target_level || "N5"}
          userId={user.id}
          onLevelChanged={handleLevelChanged}
        />
      )}
    </>
  );
}