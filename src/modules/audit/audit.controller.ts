import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Types } from 'mongoose';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve audit logs history with pagination and filters',
  })
  async getLogs(@Query() query: any, @Req() req: any) {
    // جلب الـ company_id من التوكن الخاص بالمدير
    const companyId = new Types.ObjectId(req.user.companyId);
    return await this.auditService.getLogs(query, companyId);
  }
}
