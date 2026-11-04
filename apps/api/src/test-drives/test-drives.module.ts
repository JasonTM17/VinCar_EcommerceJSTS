import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../prisma/prisma.service';
import { TestDriveController } from './test-drive.controller';
import { TestDriveService } from './test-drive.service';

@Module({
  imports: [AuthModule, NotificationsModule, AuditModule],
  controllers: [TestDriveController],
  providers: [TestDriveService, PrismaService],
})
export class TestDrivesModule {}
