import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuditService } from './audit.service';

@Controller('admin/audit-logs')
@UseGuards(AuthGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@CurrentUser() user: { role: string }) {
    if (user.role !== 'ADMIN') return { data: [], forbidden: true };
    return this.audit.list();
  }
}
