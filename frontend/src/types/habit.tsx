export interface Habit {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  frequency: string;
  is_active: boolean;
  created_at: string;
  current_streak: number;
  longest_streak: number;
  is_completed_today: boolean;
}

export interface HabitCreateRequest {
  name: string;
  description?: string;
  frequency?: string;
}

export interface HabitUpdateRequest {
  name?: string;
  description?: string;
  frequency?: string;
  is_active?: boolean;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  logged_date: string;
  completed_at: string;
}

export interface HabitStats {
  habit_id: number;
  current_streak: number;
  longest_streak: number;
  history: string[];
}
