import { Module } from '@nestjs/common';
import { MemberService } from './services/member.service';
import { MemberController } from './controllers/member.controller';

@Module({
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
