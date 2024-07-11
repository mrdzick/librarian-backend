import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { SuccessResponse } from '../../common/dtos/success-response.dto';

export class GetAllBooksRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  min_stock?: number;
}

export class Book {
  @ApiProperty()
  code: string;

  @ApiProperty()
  title: string;
  
  @ApiProperty()
  author: string;
  
  @ApiProperty()
  stock: number;
}

export class GetAllBooksResponseDto extends SuccessResponse<Book[]> {}
