import { apiClient } from "./client";
import type { Journal, JournalCreateRequest, JournalUpdateRequest, ApiResponse } from "../types/journal";

export const getJournals = async (skip = 0, limit = 20): Promise<ApiResponse<Journal[]>> => {
  return apiClient.get("/journals/", { params: { skip, limit } });
};

export const getJournal = async (id: number): Promise<ApiResponse<Journal>> => {
  return apiClient.get(`/journals/${id}`);
};

export const createJournal = async (data: JournalCreateRequest): Promise<ApiResponse<Journal>> => {
  return apiClient.post("/journals/", data);
};

export const updateJournal = async (id: number, data: JournalUpdateRequest): Promise<ApiResponse<Journal>> => {
  return apiClient.patch(`/journals/${id}`, data);
};

export const deleteJournal = async (id: number): Promise<ApiResponse<null>> => {
  return apiClient.delete(`/journals/${id}`);
};
