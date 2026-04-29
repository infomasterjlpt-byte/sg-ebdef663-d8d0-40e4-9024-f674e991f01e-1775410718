import { useState, useEffect } from "react";
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

export function LevelChangeModal({
  open,
  onOpenChange,
  currentLevel,
  userId,
  onLevelChanged,
}: LevelChangeModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<string>(currentLevel);
  const [isUpdating, setIsUpdating] = useState(false);
  const { setLevel } = useLevel();

  useEffect(() => {
    setSelectedLevel(currentLevel);
  }, [currentLevel]);

  const levels = [
    { 
      value: "N5", 
      name: "N5", 
      difficulty: "Beginner",
      color: "bg-green-500"
    },
    { 
      value: "N4", 
      name: "N4", 
      difficulty: "Elementary",
      color: "bg-teal-500"
    },
    { 
      value: "N3", 
      name: "N3", 
      difficulty: "Intermediate",
      color: "bg-purple-500"
    },
    { 
      value: "N2", 
      name: "N2", 
      difficulty: "Upper Intermediate",
      color: "bg-amber-500"
    },
    { 
      value: "N1", 
      name: "N1", 
      difficulty: "Advanced",
      color: "bg-red-900"
    },
  ];

  const handleLevelChange = async () => {
    if (!selectedLevel || selectedLevel === currentLevel) {
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({ target_level: selectedLevel })
        .eq("id", userId);

      if (error) {
        console.error("Error updating level:", error);
        return;
      }

      // Update global level context
      setLevel(selectedLevel);

      onLevelChanged();
      onOpenChange(false);
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
          <DialogTitle>Change Your Level</DialogTitle>
          <DialogDescription>
            Select your target JLPT level. This will update your practice questions and progress tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-4 py-6">
          {levels.map((level) => {
            const isSelected = selectedLevel === level.value;
            
            return (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={`relative flex flex-col items-center p-5 rounded-xl border-2 transition-all hover:bg-gray-50 ${
                  isSelected
                    ? "border-[#cc1f1f] bg-white"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Checkmark for selected level */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-[#cc1f1f]" />
                  </div>
                )}

                {/* Level badge */}
                <div className={`w-16 h-16 rounded-full ${level.color} flex items-center justify-center mb-3`}>
                  <span className="text-2xl font-bold text-white">{level.name}</span>
                </div>

                {/* Level name */}
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {level.name}
                </div>

                {/* Difficulty label */}
                <div className="text-sm text-gray-500">
                  {level.difficulty}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
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