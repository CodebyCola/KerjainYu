export type ApiError = {
  code: string;
  message: string;
  httpStatus: number;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiError;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
