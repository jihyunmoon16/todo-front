export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  tag?: string;
  quadrant: EisenhowerQuadrant;
  completed: boolean;
  pomodoroTime: number; // in minutes
}
