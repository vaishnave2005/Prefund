import { Controller, Get, Post, Patch, Put, Body, Param, Query, Request, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentRequestsService } from './payment-requests.service';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/payment-requests')
export class PaymentRequestsController {
  constructor(private svc: PaymentRequestsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('document'))
  create(@Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
    return this.svc.create(body, req.user);
  }

  @Get()
  findAll(@Request() req, @Query() query: any) {
    return this.svc.findAllForRole(req.user, query);
  }

  @Get('completed')
  getCompleted(@Query() query: any) {
    return this.svc.getCompletedDisbursements(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post(':id/claim')
  claim(@Param('id') id: string, @Request() req) {
    return this.svc.claim(id, req.user);
  }

  @Post(':id/gfsu-review')
  gfsuReview(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.gfsuReview(id, body, req.user);
  }

  @Post('asa-settlement')
  asaSettlement(@Body() body: any, @Request() req) {
    return this.svc.asaSettlement(body, req.user);
  }

  @Post(':id/cac-review')
  cacReview(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.cacReview(id, body, req.user);
  }

  @Post(':id/treasury-review')
  treasuryReview(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.treasuryReview(id, body, req.user);
  }

  @Post(':id/post-treasury-review')
  postTreasuryReview(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.postTreasuryReview(id, body, req.user);
  }

  @Patch(':id/payment-initiated')
  paymentInitiated(@Param('id') id: string, @Request() req) {
    return this.svc.paymentInitiated(id, req.user);
  }

  @Post(':id/execute-payment')
  @UseInterceptors(FileInterceptor('mt103'))
  executePayment(@Param('id') id: string, @Body() body: any, @Request() req, @UploadedFile() file?: Express.Multer.File) {
    return this.svc.executePayment(id, body, req.user, file);
  }

  @Put(':id/resubmit')
  resubmit(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.svc.resubmit(id, body, req.user);
  }

  @Patch(':id/lms-entry')
  updateLmsEntry(@Param('id') id: string, @Body() body: { lmsEntry: boolean }, @Request() req) {
    return this.svc.updateLmsEntry(id, body.lmsEntry, req.user);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('document'))
  addDocument(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.svc.addDocument(id, file, req.user);
  }
}
