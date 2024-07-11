import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundError } from '../../common/errors/not-found.error';
import { ConflictError } from '../../common/errors/conflict.error';
import { Member } from '../entities/member.entity';
import { DateUtil } from 'src/common/utils/date.util';

@Injectable()
export class MemberService {
  constructor (private readonly prismaService: PrismaService) {}

  async create(member: Member): Promise<string> {
    const memberExists = await this.prismaService.member.findFirst({
      where: {
        code: member.getCode(),
      },
    });

    if (memberExists) {
      throw new ConflictError(`Member with code ${member.getCode()} already exists`);
    }

    const createdMember = await this.prismaService.member.create({
      data: {
        code: member.getCode(),
        name: member.getName(),
      },
    });

    return createdMember.code;
  }

  async findAll(): Promise<Member[]> {
    // Unpenalized members that has reach end of penalty period
    await this.prismaService.member.updateMany({
      where: {
        isPenalized: true,
        penaltyExpirationDate: {
          lte: new Date(),
        },
      },
      data: {
        isPenalized: false,
        penaltyExpirationDate: null,
      },
    });

    const members = await this.prismaService.member.findMany();

    const memberEntities = members.map((member) => {
      const memberEntity = new Member();
      memberEntity.setId(member.id);
      memberEntity.setCode(member.code);
      memberEntity.setName(member.name);
      memberEntity.setBorrowedBooksCount(member.borrowedBooksCount);
      memberEntity.setIsPenalized(member.isPenalized);
      memberEntity.setCreatedAt(member.createdAt);

      return memberEntity;
    });

    return memberEntities;
  }

  async updateByMemberCode(code: string, newMember: Member): Promise<void> {
    const member = await this.prismaService.member.findUnique({
      where: {
        code,
      },
    });

    if (!member) {
      throw new NotFoundError(`Member with Code ${code} not found!`);
    }

    const memberWithCode = await this.prismaService.member.findUnique({
      where: {
        code: newMember.getCode(),
      }
    })

    if (memberWithCode) {
      throw new ConflictError(`Member with Code ${newMember.getCode()} already exists!`);
    }

    await this.prismaService.member.update({
      where: {
        code: code,
      },
      data: {
        code: newMember.getCode(),
        name: newMember.getName(),
      },
    });
  }
}
