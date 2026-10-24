import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
export declare class AuditLogService {
    private repo;
    constructor(repo: Repository<AuditLog>);
    findAll(query: any): Promise<{
        items: AuditLog[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByRequestId(requestId: string): Promise<AuditLog[]>;
}
