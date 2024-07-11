import { PartialType } from '@nestjs/swagger';
import { SuccessResponse } from '../../common/dtos/success-response.dto';
import { CreateBookRequestDto } from './create-book.dto';

export class UpdateBookRequestDto extends PartialType(CreateBookRequestDto) {}

export class UpdateBookResponseDto extends SuccessResponse<void> {}
