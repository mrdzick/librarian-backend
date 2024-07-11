import { Controller, Get, Post, Body, Patch, Param, ConflictException, InternalServerErrorException, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConflictError } from '../../common/errors/conflict.error';
import { BusinessRuleViolationError } from '../../common/errors/business-rule-violation.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { SuccessResponse } from '../../common/dtos/success-response.dto';
import { BookService } from '../services/book.service';
import { CreateBookRequestDto, CreateBookResponseDto } from '../dtos/create-book.dto';
import { UpdateBookRequestDto, UpdateBookResponseDto } from '../dtos/update-book.dto';
import { Book } from '../entities/book.entity';
import { GetAllBooksRequestDto, GetAllBooksResponseDto, Book as ListBookResponseSchema } from '../dtos/get-all-books.dto';
import { BorrowBookRequestDto, BorrowBookResponseDto } from '../dtos/borrow-book.dto';
import { ReturnBookRequestDto, ReturnBookResponseDto } from '../dtos/return-book.dto'
import { getAllBooksDocsConfig } from '../docs/get-all-books.docs';

@ApiTags('Books')
@ApiExtraModels(
  ListBookResponseSchema,
  SuccessResponse,
)
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  async create(@Body() createBookDto: CreateBookRequestDto): Promise<CreateBookResponseDto> {
    try {
      const book = new Book();
      book.setCode(createBookDto.code);
      book.setTitle(createBookDto.title);
      book.setAuthor(createBookDto.author);
      book.setStock(createBookDto.stock);
  
      const createdBookCode = await this.bookService.create(book);
  
      return {
        data: { code: createdBookCode },
        statusCode: 201,
        message: 'Buku berhasil dibuat!',
      } 
    } catch (error) {
      if (error instanceof ConflictError) {
        throw new ConflictException(`Buku dengan code ${createBookDto.code} sudah ada!`);
      }

      console.log(error);
      throw new InternalServerErrorException('Terjadi kesalahan pada server!');
    }
  }

  @ApiResponse(getAllBooksDocsConfig)
  @Get()
  async findAll(@Query() getAllBooksRequestDto: GetAllBooksRequestDto): Promise<GetAllBooksResponseDto> {
    const books = await this.bookService.findAll({
      minStock: getAllBooksRequestDto.min_stock,
    });

    return {
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
    }
  }

  @Patch(':code')
  async update(@Param('code') code: string, @Body() updateBookDto: UpdateBookRequestDto): Promise<UpdateBookResponseDto> {
    try {
      const newBook = new Book();
      newBook.setCode(updateBookDto.code);
      newBook.setTitle(updateBookDto.title);
      newBook.setAuthor(updateBookDto.author);
      newBook.setStock(updateBookDto.stock);

      await this.bookService.updateByCode(code, newBook);

      return {
        statusCode: 200,
        message: 'Buku berhasil diupdate!',
      }
    } catch (error) {
      if (error instanceof ConflictError) {
        throw new ConflictException(`Buku dengan code ${updateBookDto.code} sudah ada!`);
      }

      if (error instanceof NotFoundError) {
        throw new NotFoundException(`Buku dengan code ${code} tidak ditemukan!`);
      }

      console.log(error);
      throw new InternalServerErrorException('Terjadi kesalahan pada server!');
    }
  }

  @Post(':code/borrow')
  async borrow(@Param('code') bookCode: string, @Body() borrowBookRequest: BorrowBookRequestDto): Promise<BorrowBookResponseDto> {
    try {
      await this.bookService.borrowBook(bookCode, borrowBookRequest.member_code);

      return {
        data: {
          book_code: bookCode,
          member_code: borrowBookRequest.member_code,
        },
        statusCode: 201,
        message: 'Buku berhasil dipinjam!',
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        if (error.message.includes('Book')) {
          throw new NotFoundException(`Buku dengan code ${bookCode} tidak ditemukan!`);
        } else {
          throw new NotFoundException(`Anggota dengan code ${borrowBookRequest.member_code} tidak ditemukan!`);
        }
      }

      if (error instanceof BusinessRuleViolationError) {
        if (error.message === `Member with Code ${borrowBookRequest.member_code} is penalized!`) {
          throw new ForbiddenException(`Anggota dengan code ${borrowBookRequest.member_code} sedang dikenakan sanksi!`);
        } else if (error.message === `Member with Code ${borrowBookRequest.member_code} has reached maximum borrowed books!`) {
          throw new ForbiddenException(`Anggota dengan code ${borrowBookRequest.member_code} sudah mencapai batas peminjaman buku!`);
        } else if (error.message === `Book with Code ${bookCode} is out of stock!`) {
          throw new ForbiddenException(`Buku dengan code ${bookCode} sudah habis dipinjam!`);
        }
      }

      console.log(error);
      throw new InternalServerErrorException('Terjadi kesalahan pada server!');
    }
  }

  @Post(':code/return')
  async return(@Param('code') bookCode: string, @Body() returnBookRequest: ReturnBookRequestDto): Promise<ReturnBookResponseDto> {
    try {
      await this.bookService.returnBook(bookCode, returnBookRequest.member_code);

      return {
        data: {
          book_code: bookCode,
          member_code: returnBookRequest.member_code,
        },
        statusCode: 201,
        message: 'Buku berhasil dikembalikan!',
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(`Buku dengan code ${bookCode} untuk member ${returnBookRequest.member_code} tidak ditemukan!`);
      }

      console.log(error);
      throw new InternalServerErrorException('Terjadi kesalahan pada server!');
    }
  }
}
