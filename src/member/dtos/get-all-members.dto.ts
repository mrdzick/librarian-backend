import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse } from '../../common/dtos/success-response.dto';

export class Member {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  borrowed_books_count: number;

  @ApiProperty()
  is_penalized: boolean;
}

export class GetAllMembersResponseDto extends SuccessResponse<Member[]> {}