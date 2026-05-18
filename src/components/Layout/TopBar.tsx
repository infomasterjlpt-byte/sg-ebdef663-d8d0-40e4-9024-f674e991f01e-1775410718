import Link from "next/link";
import { useRouter } from "next/router";
import { LogOut, Globe } from "lucide-react";
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
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setUserProfile(profile);
      const userLevel = profile?.level || "N5";
      localStorage.setItem("selectedLevel", userLevel);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleLevelChanged = () => {
    loadUserData();
    router.reload();
  };

  const isPremium = userProfile?.is_premium === true;
  const userLevel = userProfile?.level || "N5";

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src="/logo.svg"
                alt="Master JLPT"
                style={{ height: '36px', width: '36px', display: 'block', flexShrink: 0 }}
              />
              <span style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1 }}>
                <span style={{ color: '#111111' }}>Master</span>
                <span style={{ color: '#cc1f1f' }}>JLPT</span>
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Currency selector */}
              <Select value={currency} onValueChange={(val) => setCurrency(val as any)}>
                <SelectTrigger className="w-[100px] h-9">
                  <Globe className="h-4 w-4 mr-1" />
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

              {/* Premium badge */}
              {isPremium && (
                <Badge className="bg-primary text-primary-foreground hidden sm:inline-flex">Premium</Badge>
              )}

              {/* Level badge */}
              {user && userLevel && (
                <Badge
                  className={`${LEVEL_COLORS[userLevel]} text-white cursor-pointer hover:opacity-90 hidden sm:inline-flex`}
                  onClick={() => setShowLevelModal(true)}
                >
                  {userLevel}
                </Badge>
              )}

              {/* Avatar */}
              {user && (
                <Avatar className="h-9 w-9 cursor-pointer" onClick={() => router.push("/settings")}>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.email?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              )}

              {/* Sign out */}
              {user && (
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
                  <LogOut className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {user && userProfile && (
        <LevelChangeModal
          open={showLevelModal}
          onOpenChange={setShowLevelModal}
          currentLevel={userLevel}
          userId={user.id}
          onLevelChanged={handleLevelChanged}
        />
      )}
    </>
  );
}
