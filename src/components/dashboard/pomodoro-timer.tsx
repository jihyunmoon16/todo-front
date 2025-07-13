"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Pause, Play, TimerReset } from "lucide-react";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  onTimerComplete: (timeElapsed: number) => void;
}

const durationOptions = [
    { label: "5 min", value: 5 * 60 },
    { label: "10 min", value: 10 * 60 },
    { label: "25 min", value: 25 * 60 },
]

export function PomodoroTimer({ onTimerComplete }: PomodoroTimerProps) {
  const [duration, setDuration] = useState(25 * 60);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
            onTimerComplete(duration);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isActive, stopTimer, onTimerComplete, duration]);
  
  useEffect(() => {
    if (!isActive) {
        setTimeRemaining(duration);
    }
  }, [duration, isActive]);

  const handleToggle = () => {
    if (timeRemaining === 0) {
        setTimeRemaining(duration);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    stopTimer();
    setIsActive(false);
    setTimeRemaining(duration);
  };
  
  const handleDurationChange = (newDuration: number) => {
    if (!isActive) {
        setDuration(newDuration);
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
       <div className="flex items-center gap-2">
            {durationOptions.map(option => (
                <Button 
                    key={option.value}
                    variant={duration === option.value ? "default" : "secondary"}
                    onClick={() => handleDurationChange(option.value)}
                    disabled={isActive}
                    className="w-24"
                >
                    {option.label}
                </Button>
            ))}
        </div>
      <div className="font-mono text-8xl md:text-9xl font-bold text-primary">
        {formatTime(timeRemaining)}
      </div>
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="lg" onClick={handleToggle} className="w-32">
            {isActive ? <Pause className="mr-2 h-6 w-6" /> : <Play className="mr-2 h-6 w-6" />}
            {isActive ? "Pause" : "Play"}
        </Button>
        <Button variant="outline" size="lg" onClick={handleReset} className="w-32">
            <TimerReset className="mr-2 h-6 w-6" />
            Reset
        </Button>
      </div>
    </div>
  );
}
