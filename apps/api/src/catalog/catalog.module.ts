import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCatalogController } from './admin-catalog.controller';
import { CatalogController } from './catalog.controller';

@Module({
  imports: [AuthModule],
  controllers: [CatalogController, AdminCatalogController],
  providers: [PrismaService],
})
export class CatalogModule {}
