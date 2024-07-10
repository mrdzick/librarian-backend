import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponse } from '../../common/dtos/success-response.dto';

export class CreateMemberRequestDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;
}

class CreatedMember{
  code: string;
}

export class CreateMemberResponseDto extends SuccessResponse<CreatedMember> {}
