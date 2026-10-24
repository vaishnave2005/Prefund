import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('payment_request')
export class PaymentRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'request_id', unique: true })
  requestId: string;

  @Column({ name: 'request_type' })
  requestType: string;

  @Column({ name: 'agent_code' })
  agentCode: string;

  @Column({ name: 'beneficiary_name' })
  beneficiaryName: string;

  @Column({ nullable: true, type: 'text' })
  remarks: string;

  @Column()
  currency: string;

  @Column({ name: 'original_amount', type: 'decimal', precision: 18, scale: 2 })
  originalAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true, default: 1.0 })
  roe: number;

  @Column({ name: 'usd_equivalent', type: 'decimal', precision: 18, scale: 2 })
  usdEquivalent: number;

  @Column({ name: 'remittance_bank', nullable: true })
  remittanceBank: string;

  @Column({ name: 'bank_account_number', nullable: true })
  bankAccountNumber: string;

  @Column({ name: 'swift_code', nullable: true })
  swiftCode: string;

  @Column({ default: 'Submitted' })
  status: string;

  @Column({ name: 'assigned_gfsu_member', nullable: true })
  assignedGfsuMember: string;

  @Column({ name: 'gfsu_observation', nullable: true, type: 'text' })
  gfsuObservation: string;

  @Column({ name: 'gfsu_reviewed_by', nullable: true })
  gfsuReviewedBy: string;

  @Column({ name: 'gfsu_reviewed_at', nullable: true, type: 'timestamptz' })
  gfsuReviewedAt: Date;

  @Column({ name: 'cac_observation', nullable: true, type: 'text' })
  cacObservation: string;

  @Column({ name: 'cac_reviewed_by', nullable: true })
  cacReviewedBy: string;

  @Column({ name: 'cac_reviewed_at', nullable: true, type: 'timestamptz' })
  cacReviewedAt: Date;

  @Column({ name: 'treasury_reviewed_by', nullable: true })
  treasuryReviewedBy: string;

  @Column({ name: 'treasury_reviewed_at', nullable: true, type: 'timestamptz' })
  treasuryReviewedAt: Date;

  // treasury_observation not in DB - stored in gfsu_final_remarks or as a note
  // We'll use a virtual field or skip it; we track it via query_thread

  @Column({ name: 'ap_routing_email', nullable: true })
  apRoutingEmail: string;

  @Column({ name: 'gfsu_final_remarks', nullable: true, type: 'text' })
  gfsuFinalRemarks: string;

  @Column({ name: 'gfsu_forwarded_by', nullable: true })
  gfsuForwardedBy: string;

  @Column({ name: 'gfsu_forwarded_at', nullable: true, type: 'timestamptz' })
  gfsuForwardedAt: Date;

  @Column({ name: 'actual_release_date', nullable: true, type: 'date' })
  actualReleaseDate: Date;

  @Column({ name: 'proposed_release_date', nullable: true, type: 'date' })
  proposedReleaseDate: Date;

  @Column({ name: 'query_target_role', nullable: true })
  queryTargetRole: string;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: string;

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejectionReason: string;

  @Column({ name: 'is_adhoc', default: false })
  isAdhoc: boolean;

  @Column({ name: 'initiated_by', nullable: true, default: 'Agent' })
  initiatedBy: string;

  @Column({ name: 'payment_initiated', default: false })
  paymentInitiated: boolean;

  @Column({ name: 'payment_initiated_at', nullable: true, type: 'timestamptz' })
  paymentInitiatedAt: Date;

  @Column({ name: 'mt103_url', nullable: true, type: 'text' })
  mt103Url: string;

  @Column({ name: 'lms_entry_recorded', default: false })
  lmsEntry: boolean;

  @Column({ name: 'submission_date', nullable: true, type: 'timestamptz' })
  submissionDate: Date;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  documents: any[];

  @Column({ name: 'query_thread', type: 'jsonb', nullable: true, default: [] })
  queryThread: any[];

  @Column({ name: 'created_date', nullable: true, type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'updated_date', nullable: true, type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;
}
