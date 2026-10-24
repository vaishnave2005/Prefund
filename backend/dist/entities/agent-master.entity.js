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
exports.AgentMaster = void 0;
const typeorm_1 = require("typeorm");
let AgentMaster = class AgentMaster {
};
exports.AgentMaster = AgentMaster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AgentMaster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_code', unique: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "agentCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_name' }),
    __metadata("design:type", String)
], AgentMaster.prototype, "agentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entity_type', nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_office', nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "parentOffice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "pic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_currency', nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "defaultCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_name', nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'account_number_iban', nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "accountNumberIban", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'swift_code', nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "swiftCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'bank_address', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], AgentMaster.prototype, "bankAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_date', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], AgentMaster.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_date', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], AgentMaster.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by_id', nullable: true }),
    __metadata("design:type", String)
], AgentMaster.prototype, "createdById", void 0);
exports.AgentMaster = AgentMaster = __decorate([
    (0, typeorm_1.Entity)('agent_master')
], AgentMaster);
//# sourceMappingURL=agent-master.entity.js.map