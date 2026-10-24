import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private svc;
    constructor(svc: NotificationsService);
    findAll(req: any): Promise<import("../entities").Notification[]>;
    markRead(id: string): Promise<{
        success: boolean;
    }>;
    markAllRead(req: any): Promise<{
        success: boolean;
    }>;
}
