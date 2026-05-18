export interface Quote {
  id: number;
  text: string;
  author: string;
  date: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string[];
}
