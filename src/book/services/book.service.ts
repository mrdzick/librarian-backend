import { Injectable } from '@nestjs/common';
import { ConflictError } from '../../common/errors/conflict.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { BusinessRuleViolationError } from '../../common/errors/business-rule-violation.error';
import { PrismaService } from '../../prisma/prisma.service';
import { DateUtil } from '../../common/utils/date.util';
import { Book } from '../entities/book.entity';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}
  
  async create(book: Book): Promise<string> {
    const existingBook = await this.prismaService.book.findUnique({
      where: {
        code: book.getCode(),
      },
    });

    if (existingBook) {
      throw new ConflictError(`Book with code ${book.getCode()} already exists`);
    }

    const createdBook = await this.prismaService.book.create({
      data: {
        code: book.getCode(),
        title: book.getTitle(),
        author: book.getAuthor(),
        stock: book.getStock(),
      },
    });

    return createdBook.code;
  }

  async findAll(filter?: {
    minStock?: number;
  }): Promise<Book[]> {
    const condition = {};

    if (filter?.minStock) {
      condition['stock'] = {
        gte: filter.minStock,
      };
    }

    const books = await this.prismaService.book.findMany({
      where: condition,
    });

    const bookEntities = books.map((book) => {
      const bookEntity = new Book();
      bookEntity.setId(book.id);
      bookEntity.setCode(book.code);
      bookEntity.setTitle(book.title);
      bookEntity.setAuthor(book.author);
      bookEntity.setStock(book.stock);
      bookEntity.setCreatedAt(book.createdAt);

      return bookEntity;
    });

    return bookEntities;
  }

  async updateByCode(code: string, newBook: Book): Promise<void> {
    const bookExist = await this.prismaService.book.findUnique({
      where: {
        code,
      },
    });

    if (!bookExist) {
      throw new NotFoundError(`Book with Code ${code} not found!`);
    }

    const bookWithCode = await this.prismaService.book.findFirst({
      where: {
        id: {
          not: bookExist.id,
        },
        code: newBook.getCode(),
      },
    });

    if (bookWithCode) {
      throw new ConflictError(`Book with Code ${newBook.getCode()} already exists!`);
    }

    await this.prismaService.book.update({
      where: {
        id: bookExist.id,
      },
      data: {
        code: newBook.getCode(),
        title: newBook.getTitle(),
        author: newBook.getAuthor(),
        stock: newBook.getStock(),
      }
    });
  }

  async borrowBook(bookCode: string, memberCode): Promise<void> {
    const bookExist = await this.prismaService.book.findUnique({
      where: {
        code: bookCode,
      },
    });

    if (!bookExist) {
      throw new NotFoundError(`Book with Code ${bookCode} not found!`);
    }

    if (bookExist.stock === 0) {
      throw new BusinessRuleViolationError(`Book with Code ${bookCode} is out of stock!`);
    }

     const memberExist = await this.prismaService.member.findUnique({
      where: {
        code: memberCode,
      },
     });

    if (!memberExist) {
      throw new NotFoundError(`Member with Code ${memberCode} not found!`);
    }

    if (memberExist.isPenalized) {
      throw new BusinessRuleViolationError(`Member with Code ${memberCode} is penalized!`);
    }

    if (memberExist.borrowedBooksCount === 2) {
      throw new BusinessRuleViolationError(`Member with Code ${memberCode} has reached maximum borrowed books!`);
    }

    await this.prismaService.$transaction(async (trx) => {
      await trx.book.update({
        where: {
          id: bookExist.id,
        },
        data: {
          stock: bookExist.stock - 1,
        }
      });

      await trx.borrowedBook.create({
        data: {
          bookId: bookExist.id,
          memberId: memberExist.id,
        }
      });

      await trx.member.update({
        where: {
          id: memberExist.id,
        },
        data: {
          borrowedBooksCount: memberExist.borrowedBooksCount + 1,
        }
      });
    });
  }

  async returnBook(bookCode: string, memberCode: string): Promise<void> {
    const borrowedBook = await this.prismaService.borrowedBook.findFirst({
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

    if (!borrowedBook) {
      throw new NotFoundError(`Borrowed book with Book Code ${bookCode} and Member Code ${memberCode} not found!`);
    }

    const today = new Date();
    const daysBorrowed = DateUtil.getDaysDifference(borrowedBook.createdAt, today);

    await this.prismaService.$transaction(async (trx) => {
      await trx.borrowedBook.update({
        where: {
          id: borrowedBook.id,
        },
        data: {
          returnedAt: today,
        }
      });

      await trx.book.update({
        where: {
          id: borrowedBook.bookId,
        },
        data: {
          stock: {
            increment: 1,
          },
        }
      });

      await trx.member.update({
        where: {
          id: borrowedBook.memberId,
        },
        data: {
          isPenalized: daysBorrowed > 7,
          penaltyExpirationDate: daysBorrowed > 7 ? DateUtil.addDays(today, 3) : null,
          borrowedBooksCount: {
            decrement: 1,
          },
        },
      });
    });
  }
}
