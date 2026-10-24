import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_id', nullable: true })
  requestId: string;

  @Column({ name: 'actor_id' })
  actorId: string;

  @Column({ name: 'actor_role' })
  actorRole: string;

  @Column()
  action: string;

  @Column({ name: 'previous_status', nullable: true })
  previousStatus: string;

  @Column({ name: 'new_status', nullable: true })
  newStatus: string;

  @Column({ nullable: true, type: 'text' })
  remarks: string;

  @Column({ name: 'created_date', nullable: true, type: 'timestamptz' })
  createdAt: Date;
}
