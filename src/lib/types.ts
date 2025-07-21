export type EisenhowerQuadrant = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Todo {
  id: string | number;
  title: string;
  description?: string;
  dueDate: Date | string;
  tag?: string;
  quadrant?: EisenhowerQuadrant; // For frontend compatibility
  priority?: EisenhowerQuadrant; // For API compatibility
  completed: boolean;
  pomodoroTime?: number; // For frontend compatibility (in minutes)
  pomodoroMinutes?: number; // For API compatibility
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  name: string;
  token: string;
}
