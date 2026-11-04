import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { AdminController } from './admin.controller';
@Module({ imports: [AuthModule], controllers: [AdminController], providers: [PrismaService] })
export class AdminModule {}
