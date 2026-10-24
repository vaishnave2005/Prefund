import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notification.entity';

// Map from app UserRole enum to DB notification recipient_role values
const ROLE_TO_NOTIF: Record<string, string> = {
  AGENT: 'Agent',
  GFSU_AC: 'GFSU',
  CAC: 'CAC',
  TREASURY: 'Treasury',
  SG_AP: 'SG_AP',
  ADMIN: 'Agent', // Admin sees no specific notifications
};

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private repo: Repository<Notification>) {}

  async findForUser(user: any) {
    const dbRole = ROLE_TO_NOTIF[user.role] || user.role;
    const qb = this.repo.createQueryBuilder('n');
    if (user.role === 'AGENT') {
      qb.where('n.recipient_role = :role AND n.recipient_agent_code = :code', { role: dbRole, code: user.assignedOfficeCode });
    } else {
      qb.where('n.recipient_role = :role', { role: dbRole });
    }
    return qb.orderBy('n.created_date', 'DESC').take(50).getMany();
  }

  async markRead(id: string) {
    await this.repo.update(id, { read: true });
    return { success: true };
  }

  async markAllRead(user: any) {
    const dbRole = ROLE_TO_NOTIF[user.role] || user.role;
    const qb = this.repo.createQueryBuilder().update().set({ read: true });
    if (user.role === 'AGENT') {
      qb.where('recipient_role = :role AND recipient_agent_code = :code', { role: dbRole, code: user.assignedOfficeCode });
    } else {
      qb.where('recipient_role = :role', { role: dbRole });
    }
    await qb.execute();
    return { success: true };
  }
}
