import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LevelContextType {
  level: string;
  setLevel: (level: string) => void;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);

export function LevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<string>("N5");

  useEffect(() => {
    loadUserLevel();
  }, []);

  async function loadUserLevel() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Fetch level from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("level")
        .eq("id", user.id)
        .single();

      const userLevel = profile?.level || "N5";
      setLevelState(userLevel);
      
      // Also sync to localStorage for compatibility
      localStorage.setItem("selectedLevel", userLevel);
      
      console.log("🎯 Loaded user level from profiles:", userLevel);
    } else {
      // Not logged in, use N5 as default
      setLevelState("N5");
      localStorage.setItem("selectedLevel", "N5");
    }
  }

  const setLevel = (newLevel: string) => {
    console.log("🔄 Level changed to:", newLevel);
    setLevelState(newLevel);
    localStorage.setItem("selectedLevel", newLevel);
  };

  return (
    <LevelContext.Provider value={{ level, setLevel }}>
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