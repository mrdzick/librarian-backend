import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DateUtil } from '../src/common/utils/date.util';
import { AppModule } from './../src/app.module';
import { setupGlobalPipes } from '../src/config/main-config';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Book Controller (e2e)', () => {
  let prismaService: PrismaService;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  
    app = moduleFixture.createNestApplication();
    setupGlobalPipes(app);
    await app.init();
  })

  afterEach(async () => {
    await prismaService.borrowedBook.deleteMany({});
    await prismaService.member.deleteMany({});
    await prismaService.book.deleteMany({});
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  })

  describe('/books (GET)', () => {
    it('should return empty array if books data empty', () => {
      const expectedResult = {
        data: [],
        statusCode: 200,
        message: 'Berhasil mengambil data buku!'
      }

      return request(app.getHttpServer())
        .get('/books')
        .expect(200)
        .expect(expectedResult);
    });

    it('should return all books data', async () => {
      await prismaService.book.createMany({
        data: [
          {
            code: 'ABC123',
            title: 'Harry Potter',
            author: 'J.K. Rowling',
            stock: 10,
          },
          {
            code: 'DEF456',
            title: 'Yakusoku no Neverland',
            author: 'Kaiu Shirai',
            stock: 5,
          },
        ],
      });

      const expectedResult = {
        data: [
          {
            code: 'ABC123',
            title: 'Harry Potter',
            author: 'J.K. Rowling',
            stock: 10,
          },
          {
            code: 'DEF456',
            title: 'Yakusoku no Neverland',
            author: 'Kaiu Shirai',
            stock: 5,
          },
        ],
        statusCode: 200,
        message: 'Berhasil mengambil data buku!'
      }

      return request(app.getHttpServer())
        .get('/books')
        .expect(200)
        .expect(expectedResult);
    });

    it('should return filtered books data', async () => {
      await prismaService.book.createMany({
        data: [
          {
            code: 'ABC123',
            title: 'Harry Potter',
            author: 'J.K. Rowling',
            stock: 10,
          },
          {
            code: 'DEF456',
            title: 'Yakusoku no Neverland',
            author: 'Kaiu Shirai',
            stock: 5,
          },
        ],
      });

      const expectedResult = {
        data: [
          {
            code: 'ABC123',
            title: 'Harry Potter',
            author: 'J.K. Rowling',
            stock: 10,
          },
        ],
        statusCode: 200,
        message: 'Berhasil mengambil data buku!'
      }

      return request(app.getHttpServer())
        .get('/books?min_stock=10')
        .expect(200)
        .expect(expectedResult);
    });
  });

  describe('/books (POST)', () => {
    it('should create a book successfully', async () => {
      const createBookDto = {
        code: 'ABC123',
        title: 'Harry Potter',
        author: 'J.K. Rowling',
        stock: 10,
      };

      const expectedResult = {
        data: {
          code: 'ABC123',
        },
        statusCode: 201,
        message: 'Buku berhasil dibuat!',
      }

      await request(app.getHttpServer())
        .post('/books')
        .send(createBookDto)
        .expect(201)
        .expect(expectedResult);

      const books = await prismaService.book.findMany({
        where: {
          code: createBookDto.code,
        },
      });

      expect(books).toHaveLength(1);
      expect(books[0].code).toEqual(createBookDto.code);
      expect(books[0].title).toEqual(createBookDto.title);
      expect(books[0].author).toEqual(createBookDto.author);
      expect(books[0].stock).toEqual(createBookDto.stock);
    });

    it('should return bad request if property did not meet the validation', async () => {
      const createBookDto = {
        code: 'ABC123',
        title: 'Harry Potter',
      };

      const expectedResult = {
        statusCode: 400,
        error: 'Bad Request',
        message: ['author must be a string', 'stock must be an integer number'],
      }

      return request(app.getHttpServer())
        .post('/books')
        .send(createBookDto)
        .expect(400)
        .expect(expectedResult);
    });

    it('should return ConflictError if book with the same code already exists', async () => {
      const createBookDto = {
        code: 'ABC123',
        title: 'Harry Potter',
        author: 'J.K. Rowling',
        stock: 10,
      };

      await prismaService.book.create({ data: createBookDto });

      const expectedResult = {
        statusCode: 409,
        error: 'Conflict',
        message: `Buku dengan code ${createBookDto.code} sudah ada!`,
      }

      return request(app.getHttpServer())
        .post('/books')
        .send(createBookDto)
        .expect(409)
        .expect(expectedResult);
    });
  });

  describe('/books/:code (PATCH)', () => {
    it('should update a book successfully', async () => {
      const book = await prismaService.book.create({
        data: {
          code: 'ABC123',
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          stock: 10,
        }
      });

      const updateBookDto = {
        title: 'Jane Doe',
      };

      const expectedResult = {
        statusCode: 200,
        message: 'Buku berhasil diupdate!',
      }

      await request(app.getHttpServer())
        .patch(`/books/${book.code}`)
        .send(updateBookDto)
        .expect(200)
        .expect(expectedResult);

      const updatedBook = await prismaService.book.findFirst({
        where: {
          code: book.code,
        },
      });

      expect(updatedBook.code).toEqual(book.code);
      expect(updatedBook.title).toEqual(updateBookDto.title);
    });

    it('should return ConflictError if book with the same code already exists', async () => {
      const book = await prismaService.book.createMany({
        data: [
          {
            code: 'ABC123',
            title: 'Harry Potter',
            author: 'J.K. Rowling',
            stock: 10,
          },
          {
            code: 'DEF123',
            title: 'Promise Neverland',
            author: 'Kaiu Shirai',
            stock: 5,
          }
        ]
      });

      const updateBookDto = {
        code: 'DEF123',
        title: 'Harry Potter Part 2',
      };

      const expectedResult = {
        statusCode: 409,
        error: 'Conflict',
        message: `Buku dengan code ${updateBookDto.code} sudah ada!`,
      }

      return request(app.getHttpServer())
        .patch(`/books/ABC123`)
        .send(updateBookDto)
        .expect(409)
        .expect(expectedResult);
    });

    it('should return NotFoundError if book to be updated is not found', async () => {
      const code = 'ABC123';
      
      const updateBookDto = {
        code: 'DEF456',
        title: 'Harry Potter Part 2',
      };

      const expectedResult = {
        statusCode: 404,
        error: 'Not Found',
        message: `Buku dengan code ${code} tidak ditemukan!`,
      }

      return request(app.getHttpServer())
        .patch(`/books/${code}`)
        .send(updateBookDto)
        .expect(404)
        .expect(expectedResult);
    });
  });

  describe('/books/:code/borrow (POST)', () => {
    it('should borrow a book successfully', async () => {
      const book = await prismaService.book.create({
        data: {
          code: 'ABC123',
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          stock: 10,
        }
      });

      const member = await prismaService.member.create({
        data: {
          code: 'MEMBER123',
          name: 'John Doe',
          isPenalized: false,
          borrowedBooksCount: 0,
        }
      });

      const borrowBookDto = {
        member_code: member.code,
      };

      const expectedResult = {
        data: {
          book_code: book.code,
          member_code: member.code,
        },
        statusCode: 201,
        message: 'Buku berhasil dipinjam!',
      }

      await request(app.getHttpServer())
        .post(`/books/${book.code}/borrow`)
        .send(borrowBookDto)
        .expect(201)
        .expect(expectedResult);

      const existingBook = await prismaService.book.findFirst({
        where: {
          code: book.code,
        },
      });

      expect(existingBook.stock).toEqual(9);

      const existingMember = await prismaService.member.findFirst({
        where: {
          code: member.code,
        },
      });

      expect(existingMember.borrowedBooksCount).toEqual(1);

      const borrowedBooks = await prismaService.borrowedBook.findMany({});
      expect(borrowedBooks).toHaveLength(1);
    });

    it('should return 404 if book to be borrowed is not found', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      const borrowBookDto = {
        member_code: memberCode,
      };

      const expectedResult = {
        statusCode: 404,
        error: 'Not Found',
        message: `Buku dengan code ${bookCode} tidak ditemukan!`,
      }

      return request(app.getHttpServer())
        .post(`/books/${bookCode}/borrow`)
        .send(borrowBookDto)
        .expect(404)
        .expect(expectedResult);
    });

    it('should return 404 if member to borrow is not found', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      const borrowBookDto = {
        member_code: memberCode,
      };

      await prismaService.book.create({
        data: {
          code: bookCode,
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          stock: 10,
        }
      });

      const expectedResult = {
        statusCode: 404,
        error: 'Not Found',
        message: `Anggota dengan code ${memberCode} tidak ditemukan!`,
      }

      return request(app.getHttpServer())
        .post(`/books/${bookCode}/borrow`)
        .send(borrowBookDto)
        .expect(404)
        .expect(expectedResult);
    });

    it('should return 403 if member is penalized', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      const borrowBookDto = {
        member_code: memberCode,
      };

      await prismaService.book.create({
        data: {
          code: bookCode,
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          stock: 10,
        }
      });

      await prismaService.member.create({
        data: {
          code: memberCode,
          name: 'John Doe',
          isPenalized: true,
          borrowedBooksCount: 0,
        }
      });

      const expectedResult = {
        statusCode: 403,
        error: 'Forbidden',
        message: `Anggota dengan code ${memberCode} sedang dikenakan sanksi!`,
      }

      return request(app.getHttpServer())
        .post(`/books/${bookCode}/borrow`)
        .send(borrowBookDto)
        .expect(403)
        .expect(expectedResult);
    });
  });

  describe('/books/:code/return (POST)', () => {
    it('should return a book successfully', async () => {
      const book = await prismaService.book.create({
        data: {
          code: 'ABC123',
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          stock: 10,
        }
      });

      const member = await prismaService.member.create({
        data: {
          code: 'MEMBER123',
          name: 'John Doe',
          isPenalized: false,
          borrowedBooksCount: 1,
        }
      });

      await prismaService.borrowedBook.create({
        data: {
          bookId: book.id,
          memberId: member.id,
        }
      });

      const returnBookDto = {
        member_code: member.code,
      };

      const expectedResult = {
        data: {
          book_code: book.code,
          member_code: member.code,
        },
        statusCode: 201,
        message: 'Buku berhasil dikembalikan!',
      }

      await request(app.getHttpServer())
        .post(`/books/${book.code}/return`)
        .send(returnBookDto)
        .expect(201)
        .expect(expectedResult);
      
      const existingBook = await prismaService.book.findFirst({
        where: {
          code: book.code,
        },
      });

      expect(existingBook.stock).toEqual(11);

      const existingMember = await prismaService.member.findFirst({
        where: {
          code: member.code,
        },
      });

      expect(existingMember.borrowedBooksCount).toEqual(0);

      const borrowedBooks = await prismaService.borrowedBook.findMany({
        where: {
          bookId: book.id,
          memberId: member.id,
        }
      });

      expect(borrowedBooks).toHaveLength(1);
      expect(borrowedBooks[0].returnedAt).not.toBeNull();
    });

    it('should return 404 if book to be returned is not found', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      const returnBookDto = {
        member_code: memberCode,
      };

      const expectedResult = {
        statusCode: 404,
        error: 'Not Found',
        message: 'Buku dengan code ABC123 untuk member MEMBER123 tidak ditemukan!',
      }

      return request(app.getHttpServer())
        .post(`/books/${bookCode}/return`)
        .send(returnBookDto)
        .expect(404)
        .expect(expectedResult);
    });

    it('should set member as penalized if return date is late', async () => {
      const book = await prismaService.book.create({
        data: {
          code: 'ABC123',
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          stock: 10,
        },
      });

      const member = await prismaService.member.create({
        data: {
          code: 'MEMBER123',
          name: 'John Doe',
          isPenalized: false,
          borrowedBooksCount: 1,
        },
      });

      const createdBorrowedBook = await prismaService.borrowedBook.create({
        data: {
          bookId: book.id,
          memberId: member.id,
          createdAt: new Date('2022-01-01T00:00:00.000Z'),
        },
      });

      const returnBookDto = {
        member_code: member.code,
      };

      const expectedResult = {
        data: {
          book_code: book.code,
          member_code: member.code,
        },
        statusCode: 201,
        message: 'Buku berhasil dikembalikan!',
      };

      await request(app.getHttpServer())
        .post(`/books/${book.code}/return`)
        .send(returnBookDto)
        .expect(201)
        .expect(expectedResult);

      const existingMember = await prismaService.member.findFirst({
        where: {
          code: member.code,
        },
      });
      const borrowedBooks = await prismaService.borrowedBook.findMany({
        where: {
          bookId: book.id,
          memberId: member.id,
        },
      });

      expect(borrowedBooks).toHaveLength(1);
      expect(borrowedBooks[0].returnedAt).not.toBeNull();

      expect(existingMember.isPenalized).toEqual(true);
      expect(existingMember.penaltyExpirationDate).toEqual(DateUtil.addDays(borrowedBooks[0].returnedAt, 3));
    });
  });
});
