import { Controller, Get, Patch, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private svc: NotificationsService) {}

  @Get()
  findAll(@Request() req) { return this.svc.findForUser(req.user); }

  @Patch(':id/read')
  markRead(@Param('id') id: string) { return this.svc.markRead(id); }

  @Patch('mark-all-read')
  markAllRead(@Request() req) { return this.svc.markAllRead(req.user); }
}
