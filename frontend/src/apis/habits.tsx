import { apiClient } from "./client";
import type { Habit, HabitCreateRequest, HabitUpdateRequest, HabitLog, HabitStats } from "../types/habit";
import type { ApiResponse } from "../types/journal";

export const createHabit = (data: HabitCreateRequest): Promise<ApiResponse<Habit>> =>
  apiClient.post("/habits/", data);

export const getHabits = (): Promise<ApiResponse<Habit[]>> =>
  apiClient.get("/habits/");

export const updateHabit = (id: number, data: HabitUpdateRequest): Promise<ApiResponse<Habit>> =>
  apiClient.patch(`/habits/${id}`, data);

export const deleteHabit = (id: number): Promise<ApiResponse<null>> =>
  apiClient.delete(`/habits/${id}`);

export const logHabit = (id: number, loggedDate?: string): Promise<ApiResponse<HabitLog>> =>
  apiClient.post(`/habits/${id}/log`, loggedDate ? { logged_date: loggedDate } : {});

export const undoHabit = (id: number, loggedDate?: string): Promise<ApiResponse<null>> =>
  apiClient.delete(`/habits/${id}/log`, { params: loggedDate ? { logged_date: loggedDate } : {} });

export const getHabitStats = (id: number): Promise<ApiResponse<HabitStats>> =>
  apiClient.get(`/habits/${id}/stats`);
