import { PrismaClient } from '@prisma/client';

export class TableTestHelper extends PrismaClient {
  constructor({}) {
    super({
      datasourceUrl: process.env.DATABASE_URL_TEST,
    });
  }
}