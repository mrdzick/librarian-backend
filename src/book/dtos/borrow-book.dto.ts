import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { SuccessResponse } from '../../common/dtos/success-response.dto';

export class BorrowBookRequestDto {
  @ApiProperty()
  @IsString()
  member_code: string;
}

class BorrowedBook {
  book_code: string;
  member_code: string;
}

export class BorrowBookResponseDto extends SuccessResponse<BorrowedBook> {}