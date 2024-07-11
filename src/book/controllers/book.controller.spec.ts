import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConflictError } from '../../common/errors/conflict.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { BusinessRuleViolationError } from '../../common/errors/business-rule-violation.error';
import { BookController } from './book.controller';
import { BookService } from '../services/book.service';

describe('BookController', () => {
  let controller: BookController;

  const mockBookService = {
    create: jest.fn(),
    findAll: jest.fn(),
    updateByCode: jest.fn(),
    borrowBook: jest.fn(),
    returnBook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [{
        provide: BookService,
        useValue: mockBookService,
      }],
    }).compile();

    controller = module.get<BookController>(BookController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  describe('create', () => {
    it('should create a book successfully', async () => {
      const createBookDto = { code: 'ABC123', title: 'Book Title', author: 'John Doe', stock: 10 };
      const createdBookCode = 'ABC123';

      mockBookService.create.mockResolvedValue(createdBookCode);

      const result = await controller.create(createBookDto);

      expect(result).toEqual({
        data: { code: createdBookCode },
        statusCode: 201,
        message: 'Buku berhasil dibuat!',
      });
      expect(mockBookService.create).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should throw ConflictException if book code already exists', async () => {
      const createBookDto = { code: 'ABC123', title: 'Book Title', author: 'John Doe', stock: 10 };

      mockBookService.create.mockRejectedValue(new ConflictError(`Book with code ${createBookDto.code} already exists`));

      await expect(controller.create(createBookDto)).rejects.toThrow(
        new ConflictException(`Buku dengan code ${createBookDto.code} sudah ada!`)
      );
    });
  });

  describe('findAll', () => {
    it('should return all books', async () => {
      const books = [
        {
          getId: () => 1,
          getCode: () => 'ABC123',
          getTitle: () => 'Book Title',
          getAuthor: () => 'John Doe',
          getStock: () => 10,
          getCreatedAt: () => new Date(),
        },
        {
          getId: () => 2,
          getCode: () => 'DEF456',
          getTitle: () => 'Another Book Title',
          getAuthor: () => 'Jane Doe',
          getStock: () => 5,
          getCreatedAt: () => new Date(),
        },
      ];

      mockBookService.findAll.mockResolvedValue(books);

      const result = await controller.findAll({});

      expect(result).toEqual({
        data: books.map((book) => {
          return {
            code: book.getCode(),
            title: book.getTitle(),
            author: book.getAuthor(),
            stock: book.getStock(),
          }
        }),
        statusCode: 200,
        message: 'Berhasil mengambil data buku!',
      });
      expect(mockBookService.findAll).toHaveBeenCalledWith({});
    });

    it('should return all books with minimum stock', async () => {
      const books = [
        {
          getId: () => 1,
          getCode: () => 'ABC123',
          getTitle: () => 'Book Title',
          getAuthor: () => 'John Doe',
          getStock: () => 10,
          getCreatedAt: () => new Date(),
        },
        {
          getId: () => 2,
          getCode: () => 'DEF456',
          getTitle: () => 'Another Book Title',
          getAuthor: () => 'Jane Doe',
          getStock: () => 5,
          getCreatedAt: () => new Date(),
        },
      ];

      mockBookService.findAll.mockResolvedValue(books);

      const result = await controller.findAll({ min_stock: 5 });

      expect(result).toEqual({
        data: books.map((book) => {
          return {
            code: book.getCode(),
            title: book.getTitle(),
            author: book.getAuthor(),
            stock: book.getStock(),
          }
        }),
        statusCode: 200,
        message: 'Berhasil mengambil data buku!',
      });

      expect(mockBookService.findAll).toHaveBeenCalledWith({ minStock: 5 });
    });

    it('should return empty array if no books are found', async () => {
      mockBookService.findAll.mockResolvedValue([]);

      const result = await controller.findAll({});

      expect(result).toEqual({
        data: [],
        statusCode: 200,
        message: 'Berhasil mengambil data buku!',
      });

      expect(mockBookService.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const code = 'ABC123';
      const updateBookDto = { code: 'DEF456', title: 'Updated Book Title', author: 'Jane Doe', stock: 5 };

      await controller.update(code, updateBookDto);

      expect(mockBookService.updateByCode).toHaveBeenCalledWith(code, expect.any(Object));
    });

    it('should throw ConflictException if new book code already exists', async () => {
      const code = 'ABC123';
      const updateBookDto = { code: 'DEF456', title: 'Updated Book Title', author: 'Jane Doe', stock: 5 };

      mockBookService.updateByCode.mockRejectedValue(new ConflictError(`Book with code ${updateBookDto.code} already exists`));

      await expect(controller.update(code, updateBookDto)).rejects.toThrow(
        new ConflictException(`Buku dengan code ${updateBookDto.code} sudah ada!`)
      );
    });

    it('should throw NotFoundException if book to be updated is not found', async () => {
      const code = 'ABC123';
      const updateBookDto = { code: 'DEF456', title: 'Updated Book Title', author: 'Jane Doe', stock: 5 };

      mockBookService.updateByCode.mockRejectedValue(new NotFoundError(`Book with code ${code} not found`));

      await expect(controller.update(code, updateBookDto)).rejects.toThrow(
        new NotFoundException(`Buku dengan code ${code} tidak ditemukan!`)
      );
    });
  });

  describe('borrow', () => {
    it('should borrow a book successfully', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      const result = await controller.borrow(bookCode, {
        member_code: memberCode,
      });

      expect(mockBookService.borrowBook).toHaveBeenCalledWith(bookCode, memberCode);
      expect(result).toEqual({
        data: {
          book_code: bookCode,
          member_code: memberCode,
        },
        statusCode: 201,
        message: 'Buku berhasil dipinjam!',
      });
    });

    it('should throw NotFoundException if book is not found', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      mockBookService.borrowBook.mockRejectedValue(new NotFoundError(`Book with code ${bookCode} not found`));

      await expect(controller.borrow(bookCode, { member_code: memberCode })).rejects.toThrow(
        new NotFoundException(`Buku dengan code ${bookCode} tidak ditemukan!`)
      );
    });

    it('should throw NotFoundException if member is not found', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      mockBookService.borrowBook.mockRejectedValue(new NotFoundError(`Member with code ${memberCode} not found`));

      await expect(controller.borrow(bookCode, { member_code: memberCode })).rejects.toThrow(
        new NotFoundException(`Anggota dengan code ${memberCode} tidak ditemukan!`)
      );
    });

    it('should throw ForbiddenException if member is penalized', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      mockBookService.borrowBook.mockRejectedValue(new BusinessRuleViolationError(`Member with Code ${memberCode} is penalized!`));

      await expect(controller.borrow(bookCode, { member_code: memberCode })).rejects.toThrow(
        new ForbiddenException(`Anggota dengan code ${memberCode} sedang dikenakan sanksi!`)
      );
    });

    it('should throw ForbiddenException if book is out of stock', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      mockBookService.borrowBook.mockRejectedValue(new BusinessRuleViolationError(`Book with Code ${bookCode} is out of stock!`));

      await expect(controller.borrow(bookCode, { member_code: memberCode })).rejects.toThrow(
        new ForbiddenException(`Buku dengan code ${bookCode} sudah habis dipinjam!`)
      );
    });

    it('should throw ForbiddenException if member has reached maximum borrowed books', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      mockBookService.borrowBook.mockRejectedValue(new BusinessRuleViolationError(`Member with Code ${memberCode} has reached maximum borrowed books!`));

      await expect(controller.borrow(bookCode, { member_code: memberCode })).rejects.toThrow(
        new ForbiddenException(`Anggota dengan code ${memberCode} sudah mencapai batas peminjaman buku!`)
      );
    });
  });

  describe('return', () => {
    it('should return a book successfully', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      const result = await controller.return(bookCode, {
        member_code: memberCode,
      });

      expect(mockBookService.returnBook).toHaveBeenCalledWith(bookCode, memberCode);
      expect(result).toEqual({
        data: {
          book_code: bookCode,
          member_code: memberCode,
        },
        statusCode: 201,
        message: 'Buku berhasil dikembalikan!',
      });
    });

    it('should throw NotFoundException if book is not found', async () => {
      const bookCode = 'ABC123';
      const memberCode = 'MEMBER123';

      mockBookService.returnBook.mockRejectedValue(new NotFoundError(`Borrowed book with Book Code ${bookCode} and Member Code ${memberCode} not found!`));

      await expect(controller.return(bookCode, { member_code: memberCode })).rejects.toThrow(
        new NotFoundException(`Buku dengan code ${bookCode} untuk member ${memberCode} tidak ditemukan!`)
      );
    });
  });
});
