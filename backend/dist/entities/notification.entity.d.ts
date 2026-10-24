export type NotificationRole = 'Agent' | 'GFSU' | 'CAC' | 'Treasury' | 'SG_AP';
export declare class Notification {
    id: string;
    recipientRole: string;
    recipientAgentCode: string;
    title: string;
    body: string;
    requestIdRef: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdById: string;
}
