import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  async findAll(query: any) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '50');
    const [items, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findByRequestId(requestId: string) {
    return this.repo.find({ where: { requestId }, order: { createdAt: 'ASC' } });
  }
}
