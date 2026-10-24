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
exports.PaymentRequestsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const payment_requests_service_1 = require("./payment-requests.service");
let PaymentRequestsController = class PaymentRequestsController {
    constructor(svc) {
        this.svc = svc;
    }
    create(body, req, file) {
        return this.svc.create(body, req.user);
    }
    findAll(req, query) {
        return this.svc.findAllForRole(req.user, query);
    }
    getCompleted(query) {
        return this.svc.getCompletedDisbursements(query);
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    claim(id, req) {
        return this.svc.claim(id, req.user);
    }
    gfsuReview(id, body, req) {
        return this.svc.gfsuReview(id, body, req.user);
    }
    asaSettlement(body, req) {
        return this.svc.asaSettlement(body, req.user);
    }
    cacReview(id, body, req) {
        return this.svc.cacReview(id, body, req.user);
    }
    treasuryReview(id, body, req) {
        return this.svc.treasuryReview(id, body, req.user);
    }
    postTreasuryReview(id, body, req) {
        return this.svc.postTreasuryReview(id, body, req.user);
    }
    paymentInitiated(id, req) {
        return this.svc.paymentInitiated(id, req.user);
    }
    executePayment(id, body, req, file) {
        return this.svc.executePayment(id, body, req.user, file);
    }
    resubmit(id, body, req) {
        return this.svc.resubmit(id, body, req.user);
    }
    updateLmsEntry(id, body, req) {
        return this.svc.updateLmsEntry(id, body.lmsEntry, req.user);
    }
    addDocument(id, file, req) {
        return this.svc.addDocument(id, file, req.user);
    }
};
exports.PaymentRequestsController = PaymentRequestsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('completed'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "getCompleted", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/claim'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "claim", null);
__decorate([
    (0, common_1.Post)(':id/gfsu-review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "gfsuReview", null);
__decorate([
    (0, common_1.Post)('asa-settlement'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "asaSettlement", null);
__decorate([
    (0, common_1.Post)(':id/cac-review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "cacReview", null);
__decorate([
    (0, common_1.Post)(':id/treasury-review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "treasuryReview", null);
__decorate([
    (0, common_1.Post)(':id/post-treasury-review'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "postTreasuryReview", null);
__decorate([
    (0, common_1.Patch)(':id/payment-initiated'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "paymentInitiated", null);
__decorate([
    (0, common_1.Post)(':id/execute-payment'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('mt103')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "executePayment", null);
__decorate([
    (0, common_1.Put)(':id/resubmit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "resubmit", null);
__decorate([
    (0, common_1.Patch)(':id/lms-entry'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "updateLmsEntry", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentRequestsController.prototype, "addDocument", null);
exports.PaymentRequestsController = PaymentRequestsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1/payment-requests'),
    __metadata("design:paramtypes", [payment_requests_service_1.PaymentRequestsService])
], PaymentRequestsController);
//# sourceMappingURL=payment-requests.controller.js.map