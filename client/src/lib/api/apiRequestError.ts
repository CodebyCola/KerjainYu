import { ApiError } from "@/types/api";

export class ApiRequestError extends Error {
  code: string;
  httpStatus: number;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
    this.httpStatus = error.httpStatus;
  }
}
