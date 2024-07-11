import { ApiResponseOptions, getSchemaPath } from '@nestjs/swagger';
import { SuccessResponse } from '../../common/dtos/success-response.dto';
import { Book } from '../dtos/get-all-books.dto';

export const getAllBooksDocsConfig: ApiResponseOptions = {
  status: 200,
  description: 'Sukses',
  schema: {
    allOf: [
      { $ref: getSchemaPath(SuccessResponse) },
      {
        properties: {
          data: {
            type: 'array',
            items: { $ref: getSchemaPath(Book) },
          },
        },
      },
    ],
  },
};
