export interface MoodLog {
  id: number;
  user_id: number;
  mood: string;
  notes?: string;
  logged_date: string;
  created_at: string;
}

export interface MoodLogCreateRequest {
  mood: string;
  notes?: string;
  logged_date?: string;
}

export interface MoodStats {
  stats: Record<string, number>;
}
