import { PartialType } from '@nestjs/swagger';
import { SuccessResponse } from '../../common/dtos/success-response.dto';
import { CreateMemberRequestDto } from './create-member.dto';

export class UpdateMemberRequestDto extends PartialType(CreateMemberRequestDto) {}

export class UpdateMemberResponseDto extends SuccessResponse<void> {}
