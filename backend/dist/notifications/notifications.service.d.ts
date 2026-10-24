import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';
export declare class NotificationsService {
    private repo;
    constructor(repo: Repository<Notification>);
    findForUser(user: any): Promise<Notification[]>;
    markRead(id: string): Promise<{
        success: boolean;
    }>;
    markAllRead(user: any): Promise<{
        success: boolean;
    }>;
}
