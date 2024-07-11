import { Test, TestingModule } from '@nestjs/testing';
import { ConflictError } from '../../common/errors/conflict.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { BusinessRuleViolationError } from '../../common/errors/business-rule-violation.error';
import { BookService } from './book.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Book } from '../entities/book.entity';

describe('BookService', () => {
  let service: BookService;
  
  const mockPrismaService = {
    $transaction: jest.fn(),
    book: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    borrowedBook: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        }
      ],
    }).compile();

    service = module.get<BookService>(BookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const book = new Book();
      book.setCode('ABC123');
      book.setTitle('Book Title');
      book.setAuthor('John Doe');
      book.setStock(10);

      mockPrismaService.book.findUnique.mockResolvedValue(null);
      mockPrismaService.book.create.mockResolvedValue({
        id: 1,
        code: 'ABC123',
        title: 'Book Title',
        author: 'John Doe',
        stock: 10,
        createdAt: new Date(),
      });

      const result = await service.create(book);

      expect(result).toEqual('ABC123');
      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'ABC123' },
      });
      expect(mockPrismaService.book.create).toHaveBeenCalledWith({
        data: {
          code: 'ABC123',
          title: 'Book Title',
          author: 'John Doe',
          stock: 10,
        },
      });
    });

    it('should throw ConflictError if book with the same code already exists', async () => {
      const book = new Book();
      book.setCode('ABC123');
      book.setTitle('Book Title');
      book.setAuthor('John Doe');
      book.setStock(10);

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 1,
        code: 'ABC123',
        title: 'Existing Book',
        author: 'John Doe',
        stock: 10,
        createdAt: new Date(),
      });

      await expect(service.create(book)).rejects.toThrow(
        new ConflictError(`Book with code ABC123 already exists`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'ABC123' },
      });

      expect(mockPrismaService.book.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all books successfully', async () => {
      const books = [
        {
          id: 1,
          code: 'ABC123',
          title: 'Book Title',
          author: 'John Doe',
          stock: 10,
          createdAt: new Date(),
        },
        {
          id: 2,
          code: 'DEF456',
          title: 'Another Book Title',
          author: 'J.K. Rowling',
          stock: 5,
          createdAt: new Date(),
        },
      ];

      mockPrismaService.book.findMany.mockResolvedValue(books);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].getCode()).toEqual('ABC123');
      expect(result[0].getTitle()).toEqual('Book Title');
      expect(result[0].getAuthor()).toEqual('John Doe');
      expect(result[0].getStock()).toEqual(10);
      expect(result[0].getCreatedAt()).toEqual(books[0].createdAt);
      expect(result[1].getCode()).toEqual('DEF456');
      expect(result[1].getTitle()).toEqual('Another Book Title');
      expect(result[1].getAuthor()).toEqual('J.K. Rowling');
      expect(result[1].getStock()).toEqual(5);
      expect(result[1].getCreatedAt()).toEqual(books[1].createdAt);

      expect(mockPrismaService.book.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return filtered books if filter is provided', async () => {
      const books = [
        {
          id: 1,
          code: 'ABC123',
          title: 'Book Title',
          author: 'John Doe',
          stock: 10,
          createdAt: new Date(),
        },
      ];

      mockPrismaService.book.findMany.mockResolvedValue(books);

      const filter = {
        minStock: 1,
      };
      const result = await service.findAll(filter);

      expect(result).toHaveLength(1);
      expect(result[0].getCode()).toEqual('ABC123');
      expect(result[0].getTitle()).toEqual('Book Title');
      expect(result[0].getAuthor()).toEqual('John Doe');
      expect(result[0].getStock()).toEqual(10);
      expect(result[0].getCreatedAt()).toEqual(books[0].createdAt);

      expect(mockPrismaService.book.findMany).toHaveBeenCalledWith({
        where: {
          stock: {
            gte: 1,
          },
        },
      });
      expect(mockPrismaService.book.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if there are no books', async () => {
      mockPrismaService.book.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);

      expect(mockPrismaService.book.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateBookByCode', () => {
    it('should update a book successfully', async () => {
      const code = 'ABC123';
      const newBook = new Book();

      newBook.setCode('ABC123');
      newBook.setTitle('Book Title');
      newBook.setAuthor('John Doe');
      newBook.setStock(10);

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 1,
        code: 'ABC123',
        title: 'Existing Book',
        author: 'Jane Doe',
        stock: 5,
        createdAt: new Date(),
      });

      await service.updateByCode(code, newBook);

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'ABC123' },
      });

      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          code: 'ABC123',
          title: 'Book Title',
          author: 'John Doe',
          stock: 10,
        },
      });
    });

    it('should throw NotFoundError if book to be updated is not found', async () => {
      const code = 'ABC123';
      const newBook = new Book();
      newBook.setCode('DEF456');
      newBook.setTitle('Harry Potter');
      newBook.setAuthor('J.K. Rowling');
      newBook.setStock(10);

      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.updateByCode(code, newBook)).rejects.toThrow(
        new NotFoundError(`Book with Code ${code} not found!`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: {
          code: 'ABC123'
        },
      });
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if new book code already exists', async () => {
      const code = 'ABC123';
      const newBook = new Book();
      newBook.setCode('DEF456');
      newBook.setTitle('Harry Potter');
      newBook.setAuthor('J.K. Rowling');
      newBook.setStock(10);

      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        id: 1,
        code: 'ABC123',
        name: 'Existing Book'
      });
      mockPrismaService.book.findFirst.mockResolvedValue({
        id: 2,
        code: 'DEF456',
        name: 'Existing Book'
      });


      await expect(service.updateByCode(code, newBook)).rejects.toThrow(
        new ConflictError(`Book with Code ${newBook.getCode()} already exists!`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenNthCalledWith(1, {
        where: {
          code: 'ABC123'
        },
      });
      expect(mockPrismaService.book.findFirst).toHaveBeenCalledWith({
        where: {
          code: 'DEF456',
          id: {
            not: 1,
          }
        },
      });
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
    });
  });

  describe('borrowBook', () => {
    it('should borrow a book successfully', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 1,
        code: 'BOOK-123',
        title: 'Book Title',
        author: 'John Doe',
        stock: 10,
      });

      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 11,
        code: 'MEMBER-123',
        name: 'John Doe',
        borrowedBooksCount: 0,
        isPenalized: false,
      });

      // Mock the transaction function to call the provided callback
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        await fn({
          book: mockPrismaService.book,
          borrowedBook: mockPrismaService.borrowedBook,
          member: mockPrismaService.member,
        });
      });

      // Mock the methods used within the transaction
      mockPrismaService.book.update.mockResolvedValue({});
      mockPrismaService.borrowedBook.create.mockResolvedValue({});
      mockPrismaService.member.update.mockResolvedValue({});

      await service.borrowBook(bookCode, memberCode);

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'BOOK-123' },
      });
      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { code: 'MEMBER-123' },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          stock: 9,
        },
      });
      expect(mockPrismaService.borrowedBook.create).toHaveBeenCalledWith({
        data: {
          bookId: 1,
          memberId: 11,
        },
      });
    });

    it('should throw NotFoundError if book to be borrowed is not found', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.book.findUnique.mockResolvedValue(null);

      await expect(service.borrowBook(bookCode, memberCode)).rejects.toThrow(
        new NotFoundError(`Book with Code ${bookCode} not found!`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'BOOK-123' },
      });
      expect(mockPrismaService.member.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
      expect(mockPrismaService.borrowedBook.create).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleViolationError if book is out of stock', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 1,
        code: 'BOOK-123',
        title: 'Book Title',
        author: 'John Doe',
        stock: 0,
      });

      await expect(service.borrowBook(bookCode, memberCode)).rejects.toThrow(
        new BusinessRuleViolationError(`Book with Code ${bookCode} is out of stock!`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'BOOK-123' },
      });

      expect(mockPrismaService.member.findUnique).not.toHaveBeenCalled();
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
      expect(mockPrismaService.borrowedBook.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if member to borrow the book is not found', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 1,
        code: 'BOOK-123',
        title: 'Book Title',
        author: 'John Doe',
        stock: 10,
      });

      mockPrismaService.member.findUnique.mockResolvedValue(null);

      await expect(service.borrowBook(bookCode, memberCode)).rejects.toThrow(
        new NotFoundError(`Member with Code ${memberCode} not found!`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'BOOK-123' },
      });

      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { code: 'MEMBER-123' },
      });

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
      expect(mockPrismaService.borrowedBook.create).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleViolationError if member to borrow the book is penalized', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 1,
        code: 'BOOK-123',
        title: 'Book Title',
        author: 'John Doe',
        stock: 10,
      });

      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 11,
        code: 'MEMBER-123',
        name: 'John Doe',
        borrowedBooksCount: 0,
        isPenalized: true,
      });

      await expect(service.borrowBook(bookCode, memberCode)).rejects.toThrow(
        new BusinessRuleViolationError(`Member with Code ${memberCode} is penalized!`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'BOOK-123' },
      });

      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { code: 'MEMBER-123' },
      });

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
      expect(mockPrismaService.borrowedBook.create).not.toHaveBeenCalled();
    });

    it('should throw BusinessRuleViolationError if member has reached maximum borrowed books', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.book.findUnique.mockResolvedValue({
        id: 1,
        code: 'BOOK-123',
        title: 'Book Title',
        author: 'John Doe',
        stock: 10,
      });

      mockPrismaService.member.findUnique.mockResolvedValue({
        id: 11,
        code: 'MEMBER-123',
        name: 'John Doe',
        borrowedBooksCount: 2,
        isPenalized: false,
      });

      await expect(service.borrowBook(bookCode, memberCode)).rejects.toThrow(
        new BusinessRuleViolationError(`Member with Code ${memberCode} has reached maximum borrowed books!`)
      );

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { code: 'BOOK-123' },
      });

      expect(mockPrismaService.member.findUnique).toHaveBeenCalledWith({
        where: { code: 'MEMBER-123' },
      });

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
      expect(mockPrismaService.borrowedBook.create).not.toHaveBeenCalled();
    });
  });

  describe('returnBook', () => {
    it('should return a book successfully', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.borrowedBook.findFirst.mockResolvedValue({
        id: 1,
        bookId: 1,
        memberId: 11,
        returnedAt: null,
        createdAt: new Date(),
      });

      // Mock the transaction function to call the provided callback
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        await fn({
          book: mockPrismaService.book,
          borrowedBook: mockPrismaService.borrowedBook,
          member: mockPrismaService.member,
        });
      });

      // Mock the methods used within the transaction
      mockPrismaService.book.update.mockResolvedValue({});
      mockPrismaService.borrowedBook.update.mockResolvedValue({});
      mockPrismaService.member.update.mockResolvedValue({});

      await service.returnBook(bookCode, memberCode);

      expect(mockPrismaService.borrowedBook.findFirst).toHaveBeenCalledWith({
        where: {
          book: {
            code: bookCode,
          },
          member: {
            code: memberCode,
          },
          returnedAt: null,
        },
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          stock: {
            increment: 1
          },
        },
      });
      expect(mockPrismaService.borrowedBook.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          returnedAt: expect.any(Date),
        },
      });
      expect(mockPrismaService.member.update).toHaveBeenCalledWith({
        where: { id: 11 },
        data: {
          borrowedBooksCount: {
            decrement: 1,
          },
          isPenalized: false,
          penaltyExpirationDate: null,
        },
      });
    });

    it('should throw NotFoundError if borrowed book is not found', async () => {
      const bookCode = 'BOOK-123';
      const memberCode = 'MEMBER-123';

      mockPrismaService.borrowedBook.findFirst.mockResolvedValue(null);

      await expect(service.returnBook(bookCode, memberCode)).rejects.toThrow(
        new NotFoundError(`Borrowed book with Book Code ${bookCode} and Member Code ${memberCode} not found!`)
      );

      expect(mockPrismaService.borrowedBook.findFirst).toHaveBeenCalledWith({
        where: {
          book: {
            code: bookCode,
          },
          member: {
            code: memberCode,
          },
          returnedAt: null,
        },
      });

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
      expect(mockPrismaService.book.update).not.toHaveBeenCalled();
      expect(mockPrismaService.borrowedBook.update).not.toHaveBeenCalled();
      expect(mockPrismaService.member.update).not.toHaveBeenCalled();
    });
  });
});
