import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';
import { SuccessResponse } from '../../common/dtos/success-response.dto';

export class CreateBookRequestDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsInt()
  stock: number;
}

class CreatedBook {
  code: string;
}

export class CreateBookResponseDto extends SuccessResponse<CreatedBook> {}
