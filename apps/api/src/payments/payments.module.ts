import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}
