import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('agent_master')
export class AgentMaster {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agent_code', unique: true })
  agentCode: string;

  @Column({ name: 'agent_name' })
  agentName: string;

  @Column({ name: 'entity_type', nullable: true })
  entityType: string;

  @Column({ name: 'parent_office', nullable: true })
  parentOffice: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  pic: string;

  @Column({ name: 'default_currency', nullable: true })
  defaultCurrency: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'account_number_iban', nullable: true })
  accountNumberIban: string;

  @Column({ name: 'swift_code', nullable: true })
  swiftCode: string;

  @Column({ name: 'bank_address', nullable: true, type: 'text' })
  bankAddress: string;

  @Column({ name: 'created_date', nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updated_date', nullable: true, type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;
}
