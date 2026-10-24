"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequest = void 0;
const typeorm_1 = require("typeorm");
let PaymentRequest = class PaymentRequest {
};
exports.PaymentRequest = PaymentRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_id', unique: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "requestId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'request_type' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "requestType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_code' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "agentCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'beneficiary_name' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "beneficiaryName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "remarks", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PaymentRequest.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_amount', type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], PaymentRequest.prototype, "originalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 6, nullable: true, default: 1.0 }),
    __metadata("design:type", Number)
], PaymentRequest.prototype, "roe", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usd_equivalent', type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], PaymentRequest.prototype, "usdEquivalent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'remittance_bank', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "remittanceBank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_account_number', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "bankAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'swift_code', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "swiftCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Submitted' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_gfsu_member', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "assignedGfsuMember", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gfsu_observation', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "gfsuObservation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gfsu_reviewed_by', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "gfsuReviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gfsu_reviewed_at', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "gfsuReviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cac_observation', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "cacObservation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cac_reviewed_by', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "cacReviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cac_reviewed_at', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "cacReviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'treasury_reviewed_by', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "treasuryReviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'treasury_reviewed_at', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "treasuryReviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ap_routing_email', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "apRoutingEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gfsu_final_remarks', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "gfsuFinalRemarks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gfsu_forwarded_by', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "gfsuForwardedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gfsu_forwarded_at', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "gfsuForwardedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_release_date', nullable: true, type: 'date' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "actualReleaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proposed_release_date', nullable: true, type: 'date' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "proposedReleaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'query_target_role', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "queryTargetRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejected_by', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "rejectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rejection_reason', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_adhoc', default: false }),
    __metadata("design:type", Boolean)
], PaymentRequest.prototype, "isAdhoc", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'initiated_by', nullable: true, default: 'Agent' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "initiatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_initiated', default: false }),
    __metadata("design:type", Boolean)
], PaymentRequest.prototype, "paymentInitiated", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'payment_initiated_at', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "paymentInitiatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mt103_url', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "mt103Url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lms_entry_recorded', default: false }),
    __metadata("design:type", Boolean)
], PaymentRequest.prototype, "lmsEntry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'submission_date', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "submissionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: [] }),
    __metadata("design:type", Array)
], PaymentRequest.prototype, "documents", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'query_thread', type: 'jsonb', nullable: true, default: [] }),
    __metadata("design:type", Array)
], PaymentRequest.prototype, "queryThread", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_date', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_date', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], PaymentRequest.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], PaymentRequest.prototype, "createdById", void 0);
exports.PaymentRequest = PaymentRequest = __decorate([
    (0, typeorm_1.Entity)('payment_request')
], PaymentRequest);
//# sourceMappingURL=payment-request.entity.js.map