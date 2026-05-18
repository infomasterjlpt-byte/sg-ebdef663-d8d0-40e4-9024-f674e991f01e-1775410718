import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LevelContextType {
  level: string;
  levelLoaded: boolean;
  setLevel: (level: string) => void;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);

export function LevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<string>("N5");
  const [levelLoaded, setLevelLoaded] = useState(false);

  useEffect(() => {
    loadUserLevel();
  }, []);

  async function loadUserLevel() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("level")
        .eq("id", user.id)
        .single();

      const userLevel = profile?.level || "N5";
      setLevelState(userLevel);
      localStorage.setItem("selectedLevel", userLevel);
    } else {
      setLevelState("N5");
      localStorage.setItem("selectedLevel", "N5");
    }

    setLevelLoaded(true); // ← signal that level is confirmed
  }

  const setLevel = (newLevel: string) => {
    setLevelState(newLevel);
    localStorage.setItem("selectedLevel", newLevel);
  };

  return (
    <LevelContext.Provider value={{ level, levelLoaded, setLevel }}>
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
