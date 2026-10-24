import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private svc;
    constructor(svc: AuditLogService);
    findAll(query: any): Promise<{
        items: import("../entities").AuditLog[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByRequest(requestId: string): Promise<import("../entities").AuditLog[]>;
}
