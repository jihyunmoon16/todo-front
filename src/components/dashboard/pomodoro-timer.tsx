"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, TimerReset } from "lucide-react";

interface PomodoroTimerProps {
  initialTimeInSeconds: number;
  onTimerComplete: (timeElapsed: number) => void;
}

export function PomodoroTimer({ initialTimeInSeconds, onTimerComplete }: PomodoroTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeInSeconds);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pomodoroDuration = 25 * 60;

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            stopTimer();
            setIsActive(false);
            onTimerComplete(pomodoroDuration);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isActive, stopTimer, onTimerComplete, pomodoroDuration]);

  const handleToggle = () => {
    if (timeRemaining === 0) {
        setTimeRemaining(pomodoroDuration);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    stopTimer();
    setIsActive(false);
    setTimeRemaining(pomodoroDuration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 rounded-lg bg-secondary p-2">
      <div className="font-mono text-lg font-semibold text-primary">
        {formatTime(timeRemaining)}
      </div>
      <Button variant="ghost" size="icon" onClick={handleToggle} className="h-8 w-8">
        {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        <span className="sr-only">{isActive ? "Pause" : "Play"}</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
        <TimerReset className="h-4 w-4" />
        <span className="sr-only">Reset</span>
      </Button>
    </div>
  );
}
