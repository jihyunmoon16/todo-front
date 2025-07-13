import { Dashboard } from "@/components/dashboard/dashboard";
import type { Todo } from "@/lib/types";
import { addDays } from "date-fns";

export default function Home() {
  const today = new Date();
  const mockTodos: Todo[] = [
    {
      id: "1",
      title: "Finish Q3 report",
      description: "Finalize the quarterly report for the board meeting.",
      dueDate: today,
      quadrant: "Q1",
      tag: "Work",
      completed: false,
      pomodoroTime: 75,
    },
    {
      id: "2",
      title: "Plan next week's project sprint",
      description: "Outline tasks and allocate resources for the upcoming sprint.",
      dueDate: addDays(today, 2),
      quadrant: "Q2",
      tag: "Work",
      completed: false,
      pomodoroTime: 25,
    },
    {
      id: "3",
      title: "Respond to non-urgent emails",
      description: "Clear out the inbox from non-critical emails.",
      dueDate: today,
      quadrant: "Q3",
      tag: "Admin",
      completed: true,
      pomodoroTime: 0,
    },
    {
      id: "4",
      title: "Brainstorm new feature ideas",
      description: "Creative session for future product enhancements.",
      dueDate: addDays(today, 6),
      quadrant: "Q2",
      tag: "Creative",
      completed: false,
      pomodoroTime: 0,
    },
    {
      id: "5",
      title: "Fix bug in login flow",
      description: "A critical bug is preventing users from logging in.",
      dueDate: today,
      quadrant: "Q1",
      tag: "Urgent",
      completed: false,
      pomodoroTime: 50,
    },
     {
      id: "6",
      title: "Organize digital files",
      description: "Clean up and organize project files on the cloud drive.",
      dueDate: addDays(today, 10),
      quadrant: "Q4",
      tag: "Admin",
      completed: false,
      pomodoroTime: 0,
    },
    {
      id: "7",
      title: "Prepare for university exam",
      description: "Study chapter 5-8 of the textbook.",
      dueDate: addDays(today, 4),
      quadrant: "Q2",
      tag: "Study",
      completed: false,
      pomodoroTime: 125,
    },
    {
      id: "8",
      title: "Call utility company",
      description: "Inquire about the recent billing issue.",
      dueDate: today,
      quadrant: "Q3",
      tag: "Personal",
      completed: false,
      pomodoroTime: 0,
    },
  ];

  return (
    <main>
      <Dashboard initialTodos={mockTodos} />
    </main>
  );
}
