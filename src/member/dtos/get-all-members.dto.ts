import { SuccessResponse } from '../../common/dtos/success-response.dto';

class Member {
  code: string;
  name: string;
  borrowed_books_count: number;
  is_penalized: boolean;
}

export class GetAllMembersResponseDto extends SuccessResponse<Member[]> {}