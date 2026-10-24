import { Controller, Get, Put, Post, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MasterDataService } from './master-data.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1')
export class MasterDataController {
  constructor(private svc: MasterDataService) {}

  @Get('master-data/agents')
  findAgents(@Query() query: any) { return this.svc.findAgents(query); }

  @Get('master-data/agents/:code')
  findAgent(@Param('code') code: string) { return this.svc.findAgent(code); }

  @Put('master-data/agents/:code')
  updateAgent(@Param('code') code: string, @Body() body: any) { return this.svc.updateAgent(code, body); }

  @Get('config/threshold')
  getThreshold() { return this.svc.getThreshold(); }

  @Put('config/threshold')
  updateThreshold(@Body() body: { value: number }, @Request() req) { return this.svc.updateThreshold(body.value, req.user.fullName); }

  @Get('admin/users')
  findAllUsers() { return this.svc.findAllUsers(); }

  @Put('admin/users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) { return this.svc.updateUser(id, body); }

  @Delete('admin/users/:id')
  deleteUser(@Param('id') id: string) { return this.svc.deleteUser(id); }

  @Get('config')
  getAllConfigs() { return this.svc.getAllConfigs(); }
}
