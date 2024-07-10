import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TableTestHelper } from './helpers/table-test.helper';

describe('Member Controller (e2e)', () => {
  const tableTestHelper = new TableTestHelper({});
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await tableTestHelper.member.deleteMany({});
  });

  describe('/members (GET)', () => {
    it('should return empty array if members data empty', () => {
      const expectedResult = {
        data: [],
        statusCode: 200,
        message: 'Berhasil mendapatkan semua anggota!'
      }

      return request(app.getHttpServer())
        .get('/members')
        .expect(200)
        .expect(expectedResult);
    });

    it('should return all members data', async () => {
      await tableTestHelper.member.createMany({
        data: [
          { code: 'ABC123', name: 'John Doe' },
          { code: 'DEF456', name: 'Jane Doe' },
        ],
      });

      const expectedResult = {
        data: [
          { code: 'ABC123', name: 'John Doe', borrowed_books_count: 0, is_penalized: false },
          { code: 'DEF456', name: 'Jane Doe', borrowed_books_count: 0, is_penalized: false },
        ],
        statusCode: 200,
        message: 'Berhasil mendapatkan semua anggota!'
      }

      return request(app.getHttpServer())
        .get('/members')
        .expect(200)
        .expect(expectedResult);
    });
  });

  describe('/members (POST)', () => {
    it('should create a member successfully', async () => {
      const createMemberDto = {
        code: 'ABC123',
        name: 'John Doe',
      };

      const expectedResult = {
        data: {
          code: 'ABC123',
        },
        statusCode: 201,
        message: 'Anggota berhasil dibuat!',
      }

      const response = await request(app.getHttpServer())
        .post('/members')
        .send(createMemberDto)
        .expect(201)
        .expect(expectedResult);

      const members = await tableTestHelper.member.findMany({
        where: {
          code: createMemberDto.code,
        },
      });

      expect(members).toHaveLength(1);
      expect(members[0].code).toEqual(createMemberDto.code);
      expect(members[0].name).toEqual(createMemberDto.name);
    });

    it('should return ConflictError if member with the same code already exists', async () => {
      const createMemberDto = {
        code: 'ABC123',
        name: 'John Doe',
      };

      await tableTestHelper.member.create({ data: createMemberDto });

      const expectedResult = {
        statusCode: 409,
        error: 'Conflict',
        message: `Anggota dengan code ${createMemberDto.code} sudah ada!`,
      }

      return request(app.getHttpServer())
        .post('/members')
        .send(createMemberDto)
        .expect(409)
        .expect(expectedResult);
    });
  });

  describe('/members/:code (PATCH)', () => {
    it('should update a member successfully', async () => {
      const member = await tableTestHelper.member.create({ data: { code: 'ABC123', name: 'John Doe' } });

      const updateMemberDto = {
        code: 'DEF456',
        name: 'Jane Doe',
      };

      const expectedResult = {
        statusCode: 200,
        message: 'Anggota berhasil diperbarui!',
      }

      await request(app.getHttpServer())
        .patch(`/members/${member.code}`)
        .send(updateMemberDto)
        .expect(200)
        .expect(expectedResult);

      const updatedMember = await tableTestHelper.member.findFirst({
        where: {
          code: updateMemberDto.code,
        },
      });

      expect(updatedMember.code).toEqual(updateMemberDto.code);
      expect(updatedMember.name).toEqual(updateMemberDto.name);
    });

    it('should return ConflictError if member with the same code already exists', async () => {
      const member = await tableTestHelper.member.create({ data: { code: 'ABC123', name: 'John Doe' } });

      const updateMemberDto = {
        code: 'DEF456',
        name: 'Jane Doe',
      };

      await tableTestHelper.member.create({ data: updateMemberDto });

      const expectedResult = {
        statusCode: 409,
        error: 'Conflict',
        message: `Anggota dengan code ${updateMemberDto.code} sudah ada!`,
      }

      return request(app.getHttpServer())
        .patch(`/members/${member.code}`)
        .send(updateMemberDto)
        .expect(409)
        .expect(expectedResult);
    });

    it('should return NotFoundError if member to be updated is not found', async () => {
      const code = 'ABC123';
      
      const updateMemberDto = {
        code: 'DEF456',
        name: 'Jane Doe',
      };

      const expectedResult = {
        statusCode: 404,
        error: 'Not Found',
        message: `Anggota dengan code ${code} tidak ditemukan!`,
      }

      return request(app.getHttpServer())
        .patch(`/members/${code}`)
        .send(updateMemberDto)
        .expect(404)
        .expect(expectedResult);
    });
  });
});
