import { Controller, Get, Post, Body, Patch, Param, Delete, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MemberService } from '../services/member.service';
import { Member } from '../entities/member.entity';
import { SuccessResponse } from '../../common/dtos/success-response.dto';
import { CreateMemberRequestDto, CreateMemberResponseDto } from '../dtos/create-member.dto';
import { UpdateMemberRequestDto, UpdateMemberResponseDto } from '../dtos/update-member.dto';
import { GetAllMembersResponseDto, Member as ListMemberResponseSchema } from '../dtos/get-all-members.dto';
import { ConflictError } from '../../common/errors/conflict.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { getAllMembersDocsConfig } from '../docs/get-all-members.docs';

@ApiTags('Members')
@ApiExtraModels(
  ListMemberResponseSchema,
  SuccessResponse,
)
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async create(@Body() createMemberDto: CreateMemberRequestDto): Promise<CreateMemberResponseDto> {
    try {
      const member = new Member();
      member.setCode(createMemberDto.code);
      member.setName(createMemberDto.name);

      const createdMemberCode = await this.memberService.create(member);

      return {
        data: {
          code: createdMemberCode,
        },
        statusCode: 201,
        message: 'Anggota berhasil dibuat!',
      }
    } catch (error) {
      if (error instanceof ConflictError) {
        throw new ConflictException(`Anggota dengan code ${createMemberDto.code} sudah ada!`);
      }

      throw new InternalServerErrorException('Terjadi kesalahan pada server!');
    }
  }

  @ApiResponse(getAllMembersDocsConfig)
  @Get()
  async findAll(): Promise<GetAllMembersResponseDto> {
    const members =await this.memberService.findAll();

    return {
      data: members.map((member) => {
        return {
          code: member.getCode(),
          name: member.getName(),
          borrowed_books_count: member.getBorrowedBooksCount(),
          is_penalized: member.getIsPenalized(),
        }
      }),
      statusCode: 200,
      message: 'Berhasil mendapatkan semua anggota!'
    }
  }

  @Patch(':code')
  async update(@Param('code') code: string, @Body() updateMemberDto: UpdateMemberRequestDto): Promise<UpdateMemberResponseDto> {
    try {
      const updateMember = new Member();
      updateMember.setCode(updateMemberDto.code);
      updateMember.setName(updateMemberDto.name);

      await this.memberService.updateByMemberCode(code, updateMember);

      return {
        statusCode: 200,
        message: 'Anggota berhasil diperbarui!'
      }
    } catch (error) {
      if (error instanceof ConflictError) {
        throw new ConflictException(`Anggota dengan code ${updateMemberDto.code} sudah ada!`);
      } else if (error instanceof NotFoundError) {
        throw new NotFoundException(`Anggota dengan code ${code} tidak ditemukan!`);
      }

      console.log(error);
      throw new InternalServerErrorException('Terjadi kesalahan pada server!');
    }
  }
}
