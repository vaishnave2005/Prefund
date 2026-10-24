import { Repository } from 'typeorm';
import { PaymentRequest } from '../entities/payment-request.entity';
import { AgentMaster } from '../entities/agent-master.entity';
import { Notification } from '../entities/notification.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { SystemConfig } from '../entities/system-config.entity';
export declare class PaymentRequestsService {
    private prRepo;
    private agentRepo;
    private notifRepo;
    private auditRepo;
    private configRepo;
    constructor(prRepo: Repository<PaymentRequest>, agentRepo: Repository<AgentMaster>, notifRepo: Repository<Notification>, auditRepo: Repository<AuditLog>, configRepo: Repository<SystemConfig>);
    private audit;
    private roleToNotifRole;
    private notify;
    private generateRequestId;
    create(data: any, user: any): Promise<PaymentRequest>;
    findAll(user: any, query: any): Promise<{
        items: PaymentRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAllForRole(user: any, query: any): Promise<{
        items: PaymentRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<PaymentRequest>;
    findByRequestId(requestId: string): Promise<PaymentRequest>;
    claim(id: string, user: any): Promise<PaymentRequest>;
    gfsuReview(id: string, body: any, user: any): Promise<PaymentRequest>;
    asaSettlement(body: any, user: any): Promise<PaymentRequest>;
    cacReview(id: string, body: any, user: any): Promise<PaymentRequest>;
    treasuryReview(id: string, body: any, user: any): Promise<PaymentRequest>;
    postTreasuryReview(id: string, body: any, user: any): Promise<PaymentRequest>;
    paymentInitiated(id: string, user: any): Promise<PaymentRequest>;
    executePayment(id: string, body: any, user: any, mt103File?: Express.Multer.File): Promise<PaymentRequest>;
    resubmit(id: string, body: any, user: any): Promise<PaymentRequest>;
    updateLmsEntry(id: string, lmsEntry: boolean, user: any): Promise<PaymentRequest>;
    addDocument(id: string, file: Express.Multer.File, user: any): Promise<PaymentRequest>;
    getAuditLog(requestId?: string): Promise<AuditLog[]>;
    getTierThreshold(): Promise<number>;
    getCompletedDisbursements(query: any): Promise<{
        items: PaymentRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
}
