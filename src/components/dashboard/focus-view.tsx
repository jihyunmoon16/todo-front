"use client";

import type { Todo } from "@/lib/types";
import { PomodoroTimer } from "./pomodoro-timer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FocusViewProps {
  todo: Todo;
  onExitFocus: (timeElapsedInMinutes?: number) => void;
  initialDuration: number;
  onDurationChange: (duration: number) => void;
}

export function FocusView({ todo, onExitFocus, initialDuration, onDurationChange }: FocusViewProps) {
  const handleTimerComplete = (timeElapsedInSeconds: number) => {
    onExitFocus(Math.floor(timeElapsedInSeconds / 60));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 relative">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onExitFocus()}
            className="absolute top-4 right-4 md:top-8 md:right-8"
        >
            <X className="h-6 w-6" />
            <span className="sr-only">Exit Focus Mode</span>
        </Button>
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-4xl font-bold">Focusing on:</h1>
        <p className="text-xl md:text-3xl text-muted-foreground mt-2">{todo.title}</p>
      </div>
      <PomodoroTimer 
        onTimerComplete={handleTimerComplete} 
        initialDuration={initialDuration} 
        onDurationChange={onDurationChange} 
      />
    </div>
  );
}
