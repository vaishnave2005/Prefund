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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_request_entity_1 = require("../entities/payment-request.entity");
const agent_master_entity_1 = require("../entities/agent-master.entity");
const notification_entity_1 = require("../entities/notification.entity");
const audit_log_entity_1 = require("../entities/audit-log.entity");
const system_config_entity_1 = require("../entities/system-config.entity");
let PaymentRequestsService = class PaymentRequestsService {
    constructor(prRepo, agentRepo, notifRepo, auditRepo, configRepo) {
        this.prRepo = prRepo;
        this.agentRepo = agentRepo;
        this.notifRepo = notifRepo;
        this.auditRepo = auditRepo;
        this.configRepo = configRepo;
    }
    async audit(requestId, actorId, actorRole, action, previousStatus, newStatus, remarks) {
        const log = this.auditRepo.create({
            requestId: requestId || null,
            actorId: actorId || 'system',
            actorRole: actorRole || 'SYSTEM',
            action: action || 'ACTION',
            previousStatus,
            newStatus,
            remarks,
        });
        await this.auditRepo.save(log);
    }
    roleToNotifRole(role) {
        const map = {
            AGENT: 'Agent',
            GFSU_AC: 'GFSU',
            CAC: 'CAC',
            TREASURY: 'Treasury',
            SG_AP: 'SG_AP',
        };
        return map[role] || role;
    }
    async notify(recipientRole, recipientAgentCode, title, body, requestIdRef) {
        const dbRole = this.roleToNotifRole(recipientRole);
        const notif = this.notifRepo.create({ recipientRole: dbRole, recipientAgentCode, title, body, requestIdRef });
        await this.notifRepo.save(notif);
    }
    async generateRequestId(agentCode) {
        const year = new Date().getFullYear();
        const tag = agentCode.replace('PIL_', '').substring(0, 3).toUpperCase();
        const count = await this.prRepo.count({ where: { agentCode } });
        const seq = String(count + 1).padStart(4, '0');
        return `PR-${year}-${tag}-${seq}`;
    }
    async create(data, user) {
        const agent = await this.agentRepo.findOne({ where: { agentCode: user.assignedOfficeCode } });
        if (!agent)
            throw new common_1.NotFoundException('Agent office not found');
        const requestId = await this.generateRequestId(user.assignedOfficeCode);
        const usdEquivalent = parseFloat(data.originalAmount) * parseFloat(data.roe || 1);
        const pr = this.prRepo.create({
            requestId,
            requestType: data.requestType,
            agentCode: user.assignedOfficeCode,
            beneficiaryName: data.beneficiaryName,
            remarks: data.remarks,
            currency: data.currency,
            originalAmount: data.originalAmount,
            roe: data.roe || 1,
            usdEquivalent,
            remittanceBank: agent.bankName,
            bankAccountNumber: agent.accountNumberIban,
            swiftCode: agent.swiftCode,
            status: 'Submitted',
            initiatedBy: 'Agent',
            documents: data.documents || [],
            queryThread: [],
        });
        const saved = await this.prRepo.save(pr);
        await this.audit(saved.requestId, user.id, user.role, 'REQUEST_CREATED', '', 'Submitted', `Created by ${user.fullName}`);
        await this.notify('GFSU_AC', null, 'New Payment Request', `New request ${requestId} submitted by ${agent.agentName}`, requestId);
        return saved;
    }
    async findAll(user, query) {
        const where = {};
        if (user.role === 'AGENT') {
            where.agentCode = user.assignedOfficeCode;
        }
        else if (user.role === 'GFSU_AC') {
        }
        else if (user.role === 'CAC') {
        }
        else if (user.role === 'TREASURY') {
        }
        else if (user.role === 'SG_AP') {
        }
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        const [items, total] = await this.prRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, page, limit };
    }
    async findAllForRole(user, query) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        let qb = this.prRepo.createQueryBuilder('pr');
        if (user.role === 'AGENT') {
            qb = qb.where('pr.agent_code = :code', { code: user.assignedOfficeCode });
        }
        else if (user.role === 'GFSU_AC') {
            if (query.queue === 'unassigned') {
                qb = qb.where('pr.assigned_gfsu_member IS NULL AND pr.status IN (:...statuses)', {
                    statuses: ['Submitted', 'Clarified - Under GFSU Review'],
                });
            }
            else if (query.queue === 'mine') {
                qb = qb.where('pr.assigned_gfsu_member = :name AND pr.status IN (:...statuses)', {
                    name: user.fullName,
                    statuses: ['Under GFSU Review', 'Clarified - Under GFSU Review', 'Query Raised'],
                });
            }
            else if (query.queue === 'post-treasury') {
                qb = qb.where('pr.assigned_gfsu_member = :name AND pr.status = :status', {
                    name: user.fullName,
                    status: 'Treasury Approved - Pending GFSU Verification',
                });
            }
            else {
            }
        }
        else if (user.role === 'CAC') {
            qb = qb.where('pr.status IN (:...statuses)', {
                statuses: ['CAC Pending', 'Clarified - Under CAC Review'],
            });
        }
        else if (user.role === 'TREASURY') {
            qb = qb.where('pr.status IN (:...statuses)', {
                statuses: ['CAC Approved', 'Clarified - Under Treasury Review'],
            });
        }
        else if (user.role === 'SG_AP') {
            qb = qb.where('pr.status IN (:...statuses)', {
                statuses: ['Ready for SG AP Execution', 'Payment Initiated'],
            });
        }
        if (query.search) {
            qb = qb.andWhere('(pr.request_id ILIKE :s OR pr.beneficiary_name ILIKE :s OR pr.agent_code ILIKE :s)', { s: `%${query.search}%` });
        }
        qb = qb.orderBy('pr.created_date', 'DESC').skip((page - 1) * limit).take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit };
    }
    async findOne(id) {
        const pr = await this.prRepo.findOne({ where: { id } });
        if (!pr)
            throw new common_1.NotFoundException('Payment request not found');
        return pr;
    }
    async findByRequestId(requestId) {
        const pr = await this.prRepo.findOne({ where: { requestId } });
        if (!pr)
            throw new common_1.NotFoundException('Payment request not found');
        return pr;
    }
    async claim(id, user) {
        const pr = await this.findOne(id);
        if (pr.assignedGfsuMember)
            throw new common_1.BadRequestException('Already claimed');
        const prev = pr.status;
        pr.assignedGfsuMember = user.fullName;
        pr.status = 'Under GFSU Review';
        await this.prRepo.save(pr);
        await this.audit(pr.requestId, user.id, user.role, 'CLAIMED', prev, pr.status, `Claimed by ${user.fullName}`);
        return pr;
    }
    async gfsuReview(id, body, user) {
        const pr = await this.findOne(id);
        const prev = pr.status;
        pr.gfsuObservation = body.observation;
        pr.gfsuReviewedBy = user.fullName;
        pr.gfsuReviewedAt = new Date();
        if (body.action === 'approve') {
            pr.status = 'CAC Pending';
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'GFSU_APPROVED', prev, pr.status, body.observation);
            await this.notify('CAC', null, 'New Request for CAC Approval', `Request ${pr.requestId} ready for CAC review`, pr.requestId);
        }
        else if (body.action === 'query') {
            pr.status = 'Query Raised';
            pr.queryTargetRole = body.targetRole || 'AGENT';
            pr.queryThread = [...(pr.queryThread || []), { from: user.fullName, role: user.role, message: body.observation, timestamp: new Date().toISOString() }];
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'QUERY_RAISED', prev, pr.status, body.observation);
            await this.notify('AGENT', pr.agentCode, 'Query Raised on Your Request', `Query raised on ${pr.requestId}: ${body.observation}`, pr.requestId);
        }
        else if (body.action === 'reject') {
            if (!body.rejectionReason)
                throw new common_1.BadRequestException('Rejection reason is required');
            pr.status = 'Rejected by GFSU';
            pr.rejectedBy = 'GFSU';
            pr.rejectionReason = body.rejectionReason;
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'GFSU_REJECTED', prev, pr.status, body.rejectionReason);
            await this.notify('AGENT', pr.agentCode, 'Payment Request Rejected', `Request ${pr.requestId} rejected by GFSU: ${body.rejectionReason}`, pr.requestId);
        }
        return pr;
    }
    async asaSettlement(body, user) {
        const agent = await this.agentRepo.findOne({ where: { agentCode: body.agentCode } });
        if (!agent)
            throw new common_1.NotFoundException('Agent not found');
        const requestId = await this.generateRequestId(body.agentCode);
        const usdEquivalent = parseFloat(body.originalAmount) * parseFloat(body.roe || 1);
        const pr = this.prRepo.create({
            requestId,
            requestType: 'ASA Settlement',
            agentCode: body.agentCode,
            beneficiaryName: body.beneficiaryName || agent.agentName,
            remarks: body.remarks,
            currency: body.currency || agent.defaultCurrency,
            originalAmount: body.originalAmount,
            roe: body.roe || 1,
            usdEquivalent,
            remittanceBank: agent.bankName,
            bankAccountNumber: agent.accountNumberIban,
            swiftCode: agent.swiftCode,
            status: 'CAC Pending',
            assignedGfsuMember: user.fullName,
            gfsuReviewedBy: user.fullName,
            gfsuReviewedAt: new Date(),
            gfsuObservation: body.gfsuObservation || 'ASA Settlement - submitted directly by GFSU',
            initiatedBy: user.fullName,
            documents: body.documents || [],
            queryThread: [],
        });
        const saved = await this.prRepo.save(pr);
        await this.audit(saved.requestId, user.id, user.role, 'ASA_SETTLEMENT_CREATED', '', 'CAC Pending', `ASA Settlement created by ${user.fullName}`);
        await this.notify('CAC', null, 'New ASA Settlement for CAC Approval', `ASA Settlement ${requestId} from ${agent.agentName} ready for CAC review`, requestId);
        return saved;
    }
    async cacReview(id, body, user) {
        const pr = await this.findOne(id);
        const prev = pr.status;
        pr.cacObservation = body.observation;
        pr.cacReviewedBy = user.fullName;
        pr.cacReviewedAt = new Date();
        if (body.action === 'approve') {
            pr.status = 'CAC Approved';
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'CAC_APPROVED', prev, pr.status, body.observation);
            await this.notify('TREASURY', null, 'Request Ready for Treasury Authorization', `Request ${pr.requestId} approved by CAC, awaiting Treasury`, pr.requestId);
        }
        else if (body.action === 'query') {
            pr.status = 'Query Raised';
            pr.queryTargetRole = body.targetRoles?.join(',') || 'AGENT';
            pr.queryThread = [...(pr.queryThread || []), { from: user.fullName, role: user.role, message: body.observation, timestamp: new Date().toISOString(), targets: body.targetRoles }];
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'CAC_QUERY', prev, pr.status, body.observation);
            const targets = body.targetRoles || ['AGENT'];
            for (const target of targets) {
                await this.notify(target, target === 'AGENT' ? pr.agentCode : null, 'Query from CAC', `CAC raised a query on ${pr.requestId}: ${body.observation}`, pr.requestId);
            }
        }
        else if (body.action === 'reject') {
            if (!body.rejectionReason)
                throw new common_1.BadRequestException('Rejection reason is required');
            pr.status = 'Rejected by CAC';
            pr.rejectedBy = 'CAC';
            pr.rejectionReason = body.rejectionReason;
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'CAC_REJECTED', prev, pr.status, body.rejectionReason);
            await this.notify('AGENT', pr.agentCode, 'Request Rejected by CAC', `Request ${pr.requestId} rejected by CAC: ${body.rejectionReason}`, pr.requestId);
        }
        return pr;
    }
    async treasuryReview(id, body, user) {
        const pr = await this.findOne(id);
        if (!body.observation)
            throw new common_1.BadRequestException('Mandatory observation required');
        const prev = pr.status;
        pr.treasuryReviewedBy = user.fullName;
        pr.treasuryReviewedAt = new Date();
        if (body.action === 'approve') {
            pr.status = 'Treasury Approved - Pending GFSU Verification';
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'TREASURY_APPROVED', prev, pr.status, body.observation);
            await this.notify('GFSU_AC', null, 'Treasury Approved - Post-Treasury Verification Required', `Request ${pr.requestId} approved by Treasury. ${pr.assignedGfsuMember ? 'Assigned to ' + pr.assignedGfsuMember : 'Please assign'}`, pr.requestId);
        }
        else if (body.action === 'reject') {
            if (!body.rejectionReason)
                throw new common_1.BadRequestException('Rejection reason is required');
            pr.status = 'Rejected by Treasury';
            pr.rejectedBy = 'Treasury';
            pr.rejectionReason = body.rejectionReason;
            await this.prRepo.save(pr);
            await this.audit(pr.requestId, user.id, user.role, 'TREASURY_REJECTED', prev, pr.status, body.rejectionReason);
            await this.notify('AGENT', pr.agentCode, 'Request Rejected by Treasury', `Request ${pr.requestId} rejected by Treasury: ${body.rejectionReason}`, pr.requestId);
        }
        return pr;
    }
    async postTreasuryReview(id, body, user) {
        const pr = await this.findOne(id);
        if (!body.actualReleaseDate)
            throw new common_1.BadRequestException('Final Payment Value Date is required');
        if (!body.gfsuFinalRemarks)
            throw new common_1.BadRequestException('Final remarks are required');
        const prev = pr.status;
        pr.actualReleaseDate = new Date(body.actualReleaseDate);
        pr.gfsuFinalRemarks = body.gfsuFinalRemarks;
        pr.gfsuForwardedBy = user.fullName;
        pr.status = 'Ready for SG AP Execution';
        await this.prRepo.save(pr);
        await this.audit(pr.requestId, user.id, user.role, 'GFSU_FORWARDED_TO_AP', prev, pr.status, body.gfsuFinalRemarks);
        await this.notify('SG_AP', null, 'New Payment Ready for Execution', `Request ${pr.requestId} ready for SG AP execution. Value Date: ${body.actualReleaseDate}`, pr.requestId);
        return pr;
    }
    async paymentInitiated(id, user) {
        const pr = await this.findOne(id);
        const prev = pr.status;
        pr.paymentInitiated = true;
        pr.status = 'Payment Initiated';
        await this.prRepo.save(pr);
        await this.audit(pr.requestId, user.id, user.role, 'PAYMENT_INITIATED', prev, pr.status, 'Payment initiated by SG AP');
        await this.notify('AGENT', pr.agentCode, 'Payment Initiated', `Payment initiated for ${pr.requestId}. MT103 receipt will follow within 1-2 days.`, pr.requestId);
        return pr;
    }
    async executePayment(id, body, user, mt103File) {
        const pr = await this.findOne(id);
        const prev = pr.status;
        if (mt103File) {
            pr.mt103Url = `/uploads/${mt103File.filename}`;
        }
        pr.status = 'Paid';
        pr.apRoutingEmail = body.apRoutingEmail || user.email;
        await this.prRepo.save(pr);
        await this.audit(pr.requestId, user.id, user.role, 'PAYMENT_EXECUTED', prev, 'Paid', 'MT103 uploaded, payment completed');
        await this.notify('AGENT', pr.agentCode, 'Payment Successful', `Payment for ${pr.requestId} has been successfully executed. MT103 uploaded.`, pr.requestId);
        return pr;
    }
    async resubmit(id, body, user) {
        const pr = await this.findOne(id);
        const prev = pr.status;
        Object.assign(pr, {
            beneficiaryName: body.beneficiaryName || pr.beneficiaryName,
            remarks: body.remarks || pr.remarks,
            currency: body.currency || pr.currency,
            originalAmount: body.originalAmount || pr.originalAmount,
            roe: body.roe || pr.roe,
            usdEquivalent: (body.originalAmount || pr.originalAmount) * (body.roe || pr.roe),
        });
        if (pr.rejectedBy === 'GFSU') {
            pr.status = 'Clarified - Under GFSU Review';
        }
        else if (pr.rejectedBy === 'CAC') {
            pr.status = 'Clarified - Under CAC Review';
        }
        else if (pr.rejectedBy === 'Treasury') {
            pr.status = 'Clarified - Under Treasury Review';
        }
        else {
            pr.status = 'Submitted';
        }
        pr.rejectionReason = undefined;
        pr.rejectedBy = undefined;
        await this.prRepo.save(pr);
        await this.audit(pr.requestId, user.id, user.role, 'RESUBMITTED', prev, pr.status, `Resubmitted by ${user.fullName}`);
        return pr;
    }
    async updateLmsEntry(id, lmsEntry, user) {
        const pr = await this.findOne(id);
        pr.lmsEntry = lmsEntry;
        await this.prRepo.save(pr);
        return pr;
    }
    async addDocument(id, file, user) {
        const pr = await this.findOne(id);
        const docs = pr.documents || [];
        docs.push({ name: file.originalname, url: `/uploads/${file.filename}`, uploadedBy: user.fullName, uploadedAt: new Date().toISOString() });
        pr.documents = docs;
        await this.prRepo.save(pr);
        return pr;
    }
    async getAuditLog(requestId) {
        if (requestId) {
            return this.auditRepo.find({ where: { requestId }, order: { createdAt: 'ASC' } });
        }
        return this.auditRepo.find({ order: { createdAt: 'DESC' }, take: 200 });
    }
    async getTierThreshold() {
        const config = await this.configRepo.findOne({ where: { configKey: 'tier_threshold_usd' } });
        return config ? parseFloat(config.configValue) : 500000;
    }
    async getCompletedDisbursements(query) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '50');
        let qb = this.prRepo.createQueryBuilder('pr').where('pr.status = :status', { status: 'Paid' });
        if (query.search) {
            qb = qb.andWhere('(pr.request_id ILIKE :s OR pr.beneficiary_name ILIKE :s)', { s: `%${query.search}%` });
        }
        qb = qb.orderBy('pr.updated_date', 'DESC').skip((page - 1) * limit).take(limit);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, limit };
    }
};
exports.PaymentRequestsService = PaymentRequestsService;
exports.PaymentRequestsService = PaymentRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_request_entity_1.PaymentRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(agent_master_entity_1.AgentMaster)),
    __param(2, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(3, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(4, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentRequestsService);
//# sourceMappingURL=payment-requests.service.js.map