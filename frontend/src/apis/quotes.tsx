import { apiClient } from "./client";
import type { ApiResponse, Quote } from "../types/quote";

export const getTodayQuote = async () : Promise<ApiResponse<Quote>> => {
  return apiClient.get("/quote/today");
};
