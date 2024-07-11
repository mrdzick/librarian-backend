import { ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponse } from '../../common/dtos/success-response.dto';
import { Member } from '../dtos/get-all-members.dto';

export const getAllMembersDocsConfig: ApiResponseOptions = {
  status: 200,
  description: 'Sukses',
  schema: {
    allOf: [
      { $ref: getSchemaPath(SuccessResponse) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(Member) },
          },
        },
      },
    ],
  },
};
