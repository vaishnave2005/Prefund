export declare class AuditLog {
    id: string;
    requestId: string;
    actorId: string;
    actorRole: string;
    action: string;
    previousStatus: string;
    newStatus: string;
    remarks: string;
    createdAt: Date;
}
