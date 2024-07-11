import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse } from '../../common/dtos/success-response.dto';
import { IsString } from 'class-validator';

export class ReturnBookRequestDto {
  @ApiProperty()
  @IsString()
  member_code: string;
}

class ReturnedBook {
  book_code: string;
  member_code: string;
}

export class ReturnBookResponseDto extends SuccessResponse<ReturnedBook> {}