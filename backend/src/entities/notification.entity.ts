import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// These are the actual allowed values per the DB CHECK constraint
export type NotificationRole = 'Agent' | 'GFSU' | 'CAC' | 'Treasury' | 'SG_AP';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_role' })
  recipientRole: string;

  @Column({ name: 'recipient_agent_code', nullable: true })
  recipientAgentCode: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'request_id_ref', nullable: true })
  requestIdRef: string;

  @Column({ default: false })
  read: boolean;

  @Column({ name: 'created_date', nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updated_date', nullable: true, type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;
}
