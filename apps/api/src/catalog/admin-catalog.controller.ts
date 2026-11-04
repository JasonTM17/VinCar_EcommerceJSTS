import { Body, Controller, ForbiddenException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

class CreateModelDto {
  @IsString()
  brandId!: string;

  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  category!: string;

  @IsInt()
  @Min(1)
  seats!: number;

  @IsString()
  powertrain!: string;
}

class UpdateModelDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

class CreateTrimDto {
  @IsString()
  name!: string;

  /** VND as a decimal string so no precision is lost. */
  @IsString()
  basePriceVnd!: string;

  @IsInt()
  rangeKm!: number;

  @IsOptional()
  @IsString()
  batteryKwh?: string;
}

class CreateColorDto {
  @IsString()
  name!: string;

  @IsString()
  hex!: string;

  @IsString()
  surchargeVnd!: string;
}

class CreateOptionDto {
  @IsString()
  name!: string;

  @IsString()
  priceVnd!: string;
}

@Controller('admin/catalog')
@UseGuards(AuthGuard)
export class AdminCatalogController {
  constructor(private readonly prisma: PrismaService) {}

  private requireAdmin(user: { role: string }) {
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admin only');
  }

  @Post('vehicle-models')
  createModel(@CurrentUser() user: { role: string }, @Body() dto: CreateModelDto) {
    this.requireAdmin(user);
    return this.prisma.vehicleModel.create({
      data: {
        brandId: dto.brandId,
        name: dto.name,
        slug: dto.slug,
        category: dto.category,
        seats: dto.seats,
        powertrain: dto.powertrain,
      },
      include: { brand: true },
    });
  }

  @Patch('vehicle-models/:id')
  updateModel(@CurrentUser() user: { role: string }, @Param('id') id: string, @Body() dto: UpdateModelDto) {
    this.requireAdmin(user);
    return this.prisma.vehicleModel.update({ where: { id }, data: dto });
  }

  @Post('vehicle-models/:id/trims')
  createTrim(@CurrentUser() user: { role: string }, @Param('id') id: string, @Body() dto: CreateTrimDto) {
    this.requireAdmin(user);
    return this.prisma.vehicleTrim.create({
      data: {
        modelId: id,
        name: dto.name,
        basePriceVnd: BigInt(dto.basePriceVnd),
        rangeKm: dto.rangeKm,
        batteryKwh: dto.batteryKwh ?? null,
      },
    });
  }

  @Post('trims/:id/colors')
  createColor(@CurrentUser() user: { role: string }, @Param('id') id: string, @Body() dto: CreateColorDto) {
    this.requireAdmin(user);
    return this.prisma.exteriorColor.create({
      data: { trimId: id, name: dto.name, hex: dto.hex, surchargeVnd: BigInt(dto.surchargeVnd) },
    });
  }

  @Post('trims/:id/options')
  createOption(@CurrentUser() user: { role: string }, @Param('id') id: string, @Body() dto: CreateOptionDto) {
    this.requireAdmin(user);
    return this.prisma.trimOption.create({
      data: { trimId: id, name: dto.name, priceVnd: BigInt(dto.priceVnd) },
    });
  }
}
