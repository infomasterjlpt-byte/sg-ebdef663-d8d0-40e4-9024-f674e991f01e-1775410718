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
    { value: "N5", label: "N5 - Beginner", description: "Basic vocabulary and grammar" },
    { value: "N4", label: "N4 - Elementary", description: "Everyday conversations" },
    { value: "N3", label: "N3 - Intermediate", description: "Written and spoken Japanese" },
    { value: "N2", label: "N2 - Pre-Advanced", description: "Newspapers and conversations" },
    { value: "N1", label: "N1 - Advanced", description: "Complex topics and native materials" },
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change Target Level</DialogTitle>
          <DialogDescription>
            Select your target JLPT level. This will update your practice questions and progress tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelectedLevel(level.value)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedLevel === level.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-primary/50"
              }`}
            >
              <div className="font-semibold mb-1">{level.label}</div>
              <div className="text-sm text-muted-foreground">{level.description}</div>
            </button>
          ))}
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
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isUpdating ? "Updating..." : "Update Level"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}