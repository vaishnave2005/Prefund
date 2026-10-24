import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditLogService } from './audit-log.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/audit-log')
export class AuditLogController {
  constructor(private svc: AuditLogService) {}

  @Get()
  findAll(@Query() query: any) { return this.svc.findAll(query); }

  @Get(':requestId')
  findByRequest(@Param('requestId') requestId: string) { return this.svc.findByRequestId(requestId); }
}
