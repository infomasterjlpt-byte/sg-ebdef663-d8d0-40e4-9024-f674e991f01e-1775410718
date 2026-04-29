import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLevel } from "@/contexts/LevelContext";
import { Check } from "lucide-react";

interface LevelChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: string;
  userId: string;
  onLevelChanged: () => void;
}

const LEVEL_COLORS = {
  N5: "bg-green-500",
  N4: "bg-teal-500",
  N3: "bg-purple-500",
  N2: "bg-amber-500",
  N1: "bg-red-900"
};

export function LevelChangeModal({
  open,
  onOpenChange,
  currentLevel,
  userId,
  onLevelChanged,
}: LevelChangeModalProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<string>(currentLevel);
  const [isUpdating, setIsUpdating] = useState(false);
  const { setLevel } = useLevel();

  useEffect(() => {
    setSelectedLevel(currentLevel);
  }, [currentLevel]);

  const levels = [
    { value: "N5", label: "N5", difficulty: "Beginner" },
    { value: "N4", label: "N4", difficulty: "Elementary" },
    { value: "N3", label: "N3", difficulty: "Intermediate" },
    { value: "N2", label: "N2", difficulty: "Upper Intermediate" },
    { value: "N1", label: "N1", difficulty: "Advanced" },
  ];

  const handleLevelChange = async () => {
    if (!selectedLevel || selectedLevel === currentLevel) {
      return;
    }

    setIsUpdating(true);

    try {
      // Save to profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ level: selectedLevel })
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating profile level:", profileError);
        setIsUpdating(false);
        return;
      }

      // Also update users table for backwards compatibility
      await supabase
        .from("users")
        .update({ target_level: selectedLevel })
        .eq("id", userId);

      // Update global level context
      setLevel(selectedLevel);

      onLevelChanged();
      onOpenChange(false);

      // Redirect to practice page to load fresh data
      router.push("/practice");
    } catch (error) {
      console.error("Error updating level:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Change Your Level</DialogTitle>
          <DialogDescription className="text-base">
            Select your target JLPT level. This will update your practice questions and progress tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-4 py-6">
          {levels.map((level) => {
            const isSelected = selectedLevel === level.value;
            const colorClass = LEVEL_COLORS[level.value as keyof typeof LEVEL_COLORS];

            return (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={`relative p-5 text-center rounded-xl border-2 transition-all hover:bg-gray-50 ${
                  isSelected
                    ? "border-[#cc1f1f] bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-[#cc1f1f]" />
                  </div>
                )}

                <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center text-white text-xl font-bold mx-auto mb-3`}>
                  {level.value}
                </div>

                <div className="font-bold text-lg mb-1">{level.label}</div>
                <div className="text-sm text-gray-500">{level.difficulty}</div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLevelChange}
            disabled={isUpdating || selectedLevel === currentLevel}
            className="bg-[#cc1f1f] hover:bg-[#b01b1b] text-white"
          >
            {isUpdating ? "Updating..." : "Update Level"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}