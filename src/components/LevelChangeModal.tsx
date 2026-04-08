import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const LEVELS = [
  {
    id: "N5",
    name: "Beginner",
    color: "#22c55e",
    kanji: 500,
    grammar: 285,
    reading: 212,
    total: 997,
  },
  {
    id: "N4",
    name: "Elementary",
    color: "#06b6d4",
    kanji: 600,
    grammar: 300,
    reading: 250,
    total: 1150,
  },
  {
    id: "N3",
    name: "Intermediate",
    color: "#a855f7",
    kanji: 800,
    grammar: 350,
    reading: 300,
    total: 1450,
  },
  {
    id: "N2",
    name: "Upper Intermediate",
    color: "#f59e0b",
    kanji: 900,
    grammar: 400,
    reading: 350,
    total: 1650,
  },
  {
    id: "N1",
    name: "Advanced",
    color: "#ef4444",
    kanji: 1000,
    grammar: 450,
    reading: 400,
    total: 1850,
  },
];

interface LevelChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLevel: string;
  userId: string;
  onLevelChanged: () => void;
}

export function LevelChangeModal({ open, onOpenChange, currentLevel, userId, onLevelChanged }: LevelChangeModalProps) {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (selectedLevel === currentLevel) {
      onOpenChange(false);
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("users")
      .update({ target_level: selectedLevel })
      .eq("id", userId);

    if (error) {
      console.error("Error updating level:", error);
      setLoading(false);
      return;
    }

    setLoading(false);
    onOpenChange(false);
    onLevelChanged();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Change Your Level</DialogTitle>
          <DialogDescription>
            Select your target JLPT level
          </DialogDescription>
        </DialogHeader>

        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Changing your level will update your study plan. Your existing progress and quiz history will be kept.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {LEVELS.map((level) => {
            const isSelected = selectedLevel === level.id;

            return (
              <Card
                key={level.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? "border-2 border-[#cc1f1f]" : "border border-gray-200"
                }`}
                onClick={() => setSelectedLevel(level.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: level.color }}
                    >
                      <span className="text-white font-bold text-lg">{level.id}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-[#cc1f1f]" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-base">{level.id}</h3>
                    <p className="text-xs text-gray-500">{level.name}</p>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kanji:</span>
                      <span className="font-semibold">{level.kanji}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grammar:</span>
                      <span className="font-semibold">{level.grammar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reading:</span>
                      <span className="font-semibold">{level.reading}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold">{level.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-[#cc1f1f] hover:bg-[#b01b1b]"
          >
            {loading ? "Updating..." : `Update to ${selectedLevel}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}