import { Test, TestingModule } from '@nestjs/testing';
import { ConflictError } from '../../common/errors/conflict.error';
import { NotFoundError } from '../../common/errors/not-found.error';
import { MemberService } from './member.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Member } from '../entities/member.entity';

describe('MemberService', () => {
  let service: MemberService;

  const mockPrismaService = {
    member: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a member successfully', async () => {
      const member = new Member();
      member.setCode('ABC123');
      member.setName('John Doe');

      mockPrismaService.member.findFirst.mockResolvedValue(null);
      mockPrismaService.member.create.mockResolvedValue({ code: 'ABC123', name: 'John Doe' });

      const result = await service.create(member);

      expect(result).toEqual('ABC123');
      expect(mockPrismaService.member.findFirst).toHaveBeenCalledWith({
        where: { code: 'ABC123' },
      });
      expect(mockPrismaService.member.create).toHaveBeenCalledWith({
        data: {
          code: 'ABC123',
          name: 'John Doe',
        },
      });
    });

    it('should throw ConflictError if member with the same code already exists', async () => {
      const member = new Member();
      member.setCode('ABC123');
      member.setName('John Doe');

      mockPrismaService.member.findFirst.mockResolvedValue({ code: 'ABC123', name: 'Existing Member' });

      await expect(service.create(member)).rejects.toThrow(
        new ConflictError(`Member with code ABC123 already exists`)
      );

      expect(mockPrismaService.member.findFirst).toHaveBeenCalledWith({
        where: { code: 'ABC123' },
      });
      expect(mockPrismaService.member.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all members successfully', async () => {
      const members = [
        {
          id: 1,
          code: 'ABC123',
          name: 'John Doe',
          borrowedBooksCount: 3,
          isPenalized: false,
          createdAt: new Date('2022-01-01T00:00:00.000Z'),
        },
        {
          id: 2,
          code: 'DEF456',
          name: 'Jane Smith',
          borrowedBooksCount: 2,
          isPenalized: true,
          createdAt: new Date('2022-01-02T00:00:00.000Z'),
        },
      ];

      mockPrismaService.member.findMany.mockResolvedValue(members);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].getId()).toEqual(members[0].id);
      expect(result[0].getCode()).toEqual(members[0].code);
      expect(result[0].getName()).toEqual(members[0].name);
      expect(result[0].getBorrowedBooksCount()).toEqual(members[0].borrowedBooksCount);
      expect(result[0].getIsPenalized()).toEqual(members[0].isPenalized);
      expect(result[0].getCreatedAt()).toEqual(members[0].createdAt);
      expect(result[1].getId()).toEqual(members[1].id);
      expect(result[1].getCode()).toEqual(members[1].code);
      expect(result[1].getName()).toEqual(members[1].name);
      expect(result[1].getBorrowedBooksCount()).toEqual(members[1].borrowedBooksCount);
      expect(result[1].getIsPenalized()).toEqual(members[1].isPenalized);
      expect(result[1].getCreatedAt()).toEqual(members[1].createdAt);

      expect(mockPrismaService.member.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no members are found', async () => {
      mockPrismaService.member.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(mockPrismaService.member.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateByMemberCode', () => {
    it('should update the member successfully', async () => {
      const code = 'ABC123';
      const newMember = new Member();
      newMember.setCode('DEF456');
      newMember.setName('John Doe');

      mockPrismaService.member.findUnique.mockResolvedValueOnce({ code: 'ABC123', name: 'Jane Doe' });

      await service.updateByMemberCode(code, newMember);

      expect(mockPrismaService.member.findUnique).toHaveBeenNthCalledWith(1, {
        where: {
          code: 'ABC123',
        }
      });
      expect(mockPrismaService.member.update).toHaveBeenCalledWith({
        where: { code: 'ABC123' },
        data: {
          code: 'DEF456',
          name: 'John Doe',
        },
      });
    });

    it('should throw NotFoundError if member to be updated is not found', async () => {
      const code = 'ABC123';
      const newMember = new Member();
      newMember.setCode('DEF456');
      newMember.setName('John Doe');

      mockPrismaService.member.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateByMemberCode(code, newMember)).rejects.toThrow(
        new NotFoundError(`Member with Code ${code} not found!`)
      );

      expect(mockPrismaService.member.findUnique).toHaveBeenNthCalledWith(1, {
        where: {
          code: 'ABC123',
        }
      });
      expect(mockPrismaService.member.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictError if new member code already exists', async () => {
      const code = 'ABC123';
      const newMember = new Member();
      newMember.setCode('DEF456');
      newMember.setName('John Doe');

      mockPrismaService.member.findUnique.mockResolvedValueOnce({ code: 'GHI789', name: 'Different Member' });
      mockPrismaService.member.findUnique.mockResolvedValueOnce({ code: 'DEF456', name: 'Existing Member' });

      await expect(service.updateByMemberCode(code, newMember)).rejects.toThrow(
        new ConflictError(`Member with Code ${newMember.getCode()} already exists!`)
      );

      expect(mockPrismaService.member.findUnique).toHaveBeenNthCalledWith(1, {
        where: {
          code: 'ABC123',
        }
      });
      expect(mockPrismaService.member.findUnique).toHaveBeenNthCalledWith(2, {
        where: {
          code: 'DEF456',
        }
      });
      expect(mockPrismaService.member.update).not.toHaveBeenCalled();
    });
  });
});
