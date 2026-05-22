import { apiClient } from "./client";
import type { MoodLog, MoodLogCreateRequest, MoodStats } from "../types/mood";
import type { ApiResponse } from "../types/journal";

export const createMoodLog = (data: MoodLogCreateRequest): Promise<ApiResponse<MoodLog>> =>
  apiClient.post("/moods/", data);

export const getMoodLogs = (
  startDate?: string,
  endDate?: string,
  skip = 0,
  limit = 30
): Promise<ApiResponse<MoodLog[]>> =>
  apiClient.get("/moods/", { params: { start_date: startDate, end_date: endDate, skip, limit } });

export const getMoodStats = (
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<MoodStats>> =>
  apiClient.get("/moods/stats", { params: { start_date: startDate, end_date: endDate } });

export const deleteMoodLog = (id: number): Promise<ApiResponse<null>> =>
  apiClient.delete(`/moods/${id}`);
