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

const levelColors: Record<string, string> = {
  N5: "bg-green-500",
  N4: "bg-teal-500",
  N3: "bg-purple-500",
  N2: "bg-amber-500",
  N1: "bg-red-900"
};

const levels = [
  { value: "N5", label: "N5", difficulty: "Beginner" },
  { value: "N4", label: "N4", difficulty: "Elementary" },
  { value: "N3", label: "N3", difficulty: "Intermediate" },
  { value: "N2", label: "N2", difficulty: "Upper Intermediate" },
  { value: "N1", label: "N1", difficulty: "Advanced" },
];

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

        <div className="py-6">
          <div className="grid grid-cols-5 gap-4">
            {levels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={`relative p-5 text-center rounded-xl border transition-all hover:bg-gray-50 ${
                  selectedLevel === level.value
                    ? "border-[#cc1f1f] border-2"
                    : "border-gray-200"
                }`}
              >
                {selectedLevel === level.value && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5 text-[#cc1f1f]" />
                  </div>
                )}
                
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full ${levelColors[level.value]} flex items-center justify-center text-white text-2xl font-bold`}>
                    {level.value}
                  </div>
                  <div>
                    <div className="font-bold text-lg mb-1">{level.label}</div>
                    <div className="text-sm text-gray-500">{level.difficulty}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
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