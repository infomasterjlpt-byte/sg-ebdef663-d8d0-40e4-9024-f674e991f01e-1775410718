import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LevelContextType {
  level: string;
  setLevel: (level: string) => void;
  refreshLevel: () => Promise<void>;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);

export function LevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<string>("N5");

  // Load level from user's profile on mount
  useEffect(() => {
    loadUserLevel();
  }, []);

  async function loadUserLevel() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from("users")
      .select("target_level")
      .eq("id", user.id)
      .single();

    if (userData?.target_level) {
      setLevelState(userData.target_level);
      localStorage.setItem("selectedLevel", userData.target_level);
    }
  }

  const setLevel = (newLevel: string) => {
    console.log("🔄 Level changed to:", newLevel);
    setLevelState(newLevel);
    localStorage.setItem("selectedLevel", newLevel);
  };

  const refreshLevel = async () => {
    await loadUserLevel();
  };

  return (
    <LevelContext.Provider value={{ level, setLevel, refreshLevel }}>
      {children}
    </LevelContext.Provider>
  );
}

export function useLevel() {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error("useLevel must be used within a LevelProvider");
  }
  return context;
}