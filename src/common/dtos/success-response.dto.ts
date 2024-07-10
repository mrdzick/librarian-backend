export class SuccessResponse<T> {
  data?: T;
  statusCode: number;
  message: string;
}