import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('system_config')
export class SystemConfig {
  @PrimaryColumn({ name: 'config_key' })
  configKey: string;

  @Column({ name: 'config_value' })
  configValue: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'updated_at', nullable: true, type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;
}
