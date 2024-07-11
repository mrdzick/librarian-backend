import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConflictError } from '../../common/errors/conflict.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { MemberController } from './member.controller';
import { MemberService } from '../services/member.service';
import { Member } from '../entities/member.entity';
import { UpdateMemberRequestDto } from '../dtos/update-member.dto';

describe('MemberController', () => {
  let controller: MemberController;

  const mockMemberService = {
    create: jest.fn(),
    findAll: jest.fn(),
    updateByMemberCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemberController],
      providers: [{
        provide: MemberService,
        useValue: mockMemberService,
      }],
    }).compile();

    controller = module.get<MemberController>(MemberController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a member successfully', async () => {
      const createMemberDto = { code: 'ABC123', name: 'John Doe' };
      const createdMemberCode = 'ABC123';

      mockMemberService.create.mockResolvedValue(createdMemberCode);

      const result = await controller.create(createMemberDto);

      expect(result).toEqual({
        data: { code: createdMemberCode },
        statusCode: 201,
        message: 'Anggota berhasil dibuat!',
      });
      expect(mockMemberService.create).toHaveBeenCalledWith(expect.any(Member));
    });

    it('should throw ConflictException if member code already exists', async () => {
      const createMemberDto = { code: 'ABC123', name: 'John Doe' };

      mockMemberService.create.mockRejectedValue(new ConflictError(`Member with code ${createMemberDto.code} already exists`));

      await expect(controller.create(createMemberDto)).rejects.toThrow(
        new ConflictException(`Anggota dengan code ${createMemberDto.code} sudah ada!`)
      );

      expect(mockMemberService.create).toHaveBeenCalledWith(expect.any(Member));
    });

    it('should throw an internal server error', async () => {
      const createMemberDto = { code: 'ABC123', name: 'John Doe' };

      mockMemberService.create.mockRejectedValue(new Error('Unexpected error'));

      await expect(controller.create(createMemberDto)).rejects.toThrow(
        new InternalServerErrorException('Terjadi kesalahan pada server!')
      );

      expect(mockMemberService.create).toHaveBeenCalledWith(expect.any(Member));
    });
  });

  describe('findAll', () => {
    it('should return all members successfully', async () => {
      const members = [
        {
          getCode: () => 'ABC123',
          getName: () => 'John Doe',
          getBorrowedBooksCount: () => 3,
          getIsPenalized: () => false,
        },
        {
          getCode: () => 'DEF456',
          getName: () => 'Jane Smith',
          getBorrowedBooksCount: () => 2,
          getIsPenalized: () => true,
        },
      ];

      mockMemberService.findAll.mockResolvedValue(members);

      const result = await controller.findAll();

      expect(result).toEqual({
        data: members.map((member) => ({
          code: member.getCode(),
          name: member.getName(),
          borrowed_books_count: member.getBorrowedBooksCount(),
          is_penalized: member.getIsPenalized(),
        })),
        statusCode: 200,
        message: 'Berhasil mendapatkan semua anggota!'
      });

      expect(mockMemberService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when there are no members', async () => {
      const members = [];

      mockMemberService.findAll.mockResolvedValue(members);

      const result = await controller.findAll();

      expect(result).toEqual({
        data: [],
        statusCode: 200,
        message: 'Berhasil mendapatkan semua anggota!'
      });

      expect(mockMemberService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a member successfully', async () => {
      const code = 'ABC123';
      const updateMemberDto: UpdateMemberRequestDto = { code: 'ABC123', name: 'Updated Name' };

      await expect(controller.update(code, updateMemberDto)).resolves.toEqual({
        statusCode: 200,
        message: 'Anggota berhasil diperbarui!',
      });

      expect(mockMemberService.updateByMemberCode).toHaveBeenCalledTimes(1);
      expect(mockMemberService.updateByMemberCode).toHaveBeenCalledWith(
        code,
        expect.any(Member),
      );
    });

    it('should throw ConflictException when code already exists', async () => {
      const code = 'ABC123';
      const updateMemberDto: UpdateMemberRequestDto = { code: 'ABC123', name: 'Updated Name' };

      mockMemberService.updateByMemberCode.mockRejectedValueOnce(new ConflictError(`Member with Code ${code} already exists!`));

      await expect(controller.update(code, updateMemberDto)).rejects.toThrow(
        new ConflictException(`Anggota dengan code ${updateMemberDto.code} sudah ada!`)
      );

      expect(mockMemberService.updateByMemberCode).toHaveBeenCalledTimes(1);
      expect(mockMemberService.updateByMemberCode).toHaveBeenCalledWith(
        code,
        expect.any(Member),
      );
    });

    it('should throw NotFoundException when member is not found', async () => {
      const code = 'ABC123';
      const updateMemberDto: UpdateMemberRequestDto = { code: 'ABC123', name: 'Updated Name' };

      mockMemberService.updateByMemberCode.mockRejectedValueOnce(new NotFoundError(`Member with Code ${code} not found!`));

      await expect(controller.update(code, updateMemberDto)).rejects.toThrow(
        new NotFoundException(`Anggota dengan code ${code} tidak ditemukan!`)
      );

      expect(mockMemberService.updateByMemberCode).toHaveBeenCalledTimes(1);
      expect(mockMemberService.updateByMemberCode).toHaveBeenCalledWith(
        code,
        expect.any(Member),
      );
    });
  });
});
