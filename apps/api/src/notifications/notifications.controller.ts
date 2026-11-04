import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me/notifications')
  @UseGuards(AuthGuard)
  list(@CurrentUser() user: { sub: string }) {
    return this.notifications.listForUser(user.sub);
  }

  @Post('me/notifications/:id/read')
  @UseGuards(AuthGuard)
  read(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.notifications.markRead(user.sub, id);
  }
}
