import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  AGENT = 'AGENT',
  GFSU_AC = 'GFSU_AC',
  CAC = 'CAC',
  TREASURY = 'TREASURY',
  SG_AP = 'SG_AP',
  ADMIN = 'ADMIN',
}

@Entity('portal_user')
export class PortalUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true, nullable: true })
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  // Stored as varchar(30) in DB, not pg enum
  @Column({ type: 'varchar', length: 30 })
  role: UserRole;

  @Column({ name: 'assigned_office_code', nullable: true })
  assignedOfficeCode: string;

  @Column({ name: 'is_demo_user', default: false })
  isDemoUser: boolean;

  @Column({ name: 'created_date', type: 'timestamptz', nullable: true })
  createdAt: Date;

  @Column({ name: 'updated_date', type: 'timestamptz', nullable: true })
  updatedAt: Date;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;
}
