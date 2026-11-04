import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  meta?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Writes an audit record inside the caller's transaction. */
  async record(tx: Prisma.TransactionClient, entry: AuditEntry) {
    await tx.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        meta: entry.meta,
      },
    });
  }

  list() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }
}
