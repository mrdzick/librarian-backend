import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponse<T> {
  data?: T;
  @ApiProperty()
  statusCode: number;
  @ApiProperty()
  message: string;
}