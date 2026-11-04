import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { TestDriveService } from './test-drive.service';

class BookTestDriveDto {
  @IsString()
  dealerId!: string;

  @IsString()
  slotId!: string;

  @IsString()
  modelSlug!: string;
}

@Controller()
export class TestDriveController {
  constructor(private readonly testDrives: TestDriveService) {}

  @Get('test-drive-slots')
  slots(@Query('dealerId') dealerId: string, @Query('date') date?: string) {
    return this.testDrives.listSlots(dealerId, date);
  }

  @Get('me/test-drives')
  @UseGuards(AuthGuard)
  mine(@CurrentUser() user: { sub: string }) {
    return this.testDrives.listForUser(user.sub);
  }

  @Post('test-drives')
  @UseGuards(AuthGuard)
  book(@CurrentUser() user: { sub: string }, @Body() dto: BookTestDriveDto) {
    return this.testDrives.book(user.sub, dto);
  }

  @Post('test-drives/:id/cancel')
  @UseGuards(AuthGuard)
  cancel(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.testDrives.cancel(user.sub, id);
  }
}
