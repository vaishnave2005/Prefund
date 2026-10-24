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
exports.MasterDataService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const agent_master_entity_1 = require("../entities/agent-master.entity");
const portal_user_entity_1 = require("../entities/portal-user.entity");
const system_config_entity_1 = require("../entities/system-config.entity");
let MasterDataService = class MasterDataService {
    constructor(agentRepo, userRepo, configRepo) {
        this.agentRepo = agentRepo;
        this.userRepo = userRepo;
        this.configRepo = configRepo;
    }
    async findAgents(query) {
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');
        const search = query.search || '';
        const [items, total] = await this.agentRepo.findAndCount({
            where: search ? [
                { agentCode: (0, typeorm_2.ILike)(`%${search}%`) },
                { agentName: (0, typeorm_2.ILike)(`%${search}%`) },
                { country: (0, typeorm_2.ILike)(`%${search}%`) },
            ] : {},
            order: { agentCode: 'ASC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { items, total, page, limit };
    }
    async findAgent(code) {
        const agent = await this.agentRepo.findOne({ where: { agentCode: code } });
        if (!agent)
            throw new common_1.NotFoundException('Agent not found');
        return agent;
    }
    async updateAgent(code, data) {
        await this.agentRepo.update(code, data);
        return this.findAgent(code);
    }
    async getThreshold() {
        const config = await this.configRepo.findOne({ where: { configKey: 'tier_threshold_usd' } });
        return { value: config ? parseFloat(config.configValue) : 500000, description: config?.description || '' };
    }
    async updateThreshold(value, actorId) {
        await this.configRepo.upsert({ configKey: 'tier_threshold_usd', configValue: String(value), description: `Treasury execution tier threshold (USD). Updated by ${actorId}` }, ['configKey']);
    }
    async findAllUsers() {
        return this.userRepo.find({ order: { createdAt: 'ASC' } });
    }
    async createUser(data) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    async updateUser(id, data) {
        await this.userRepo.update(id, data);
        return this.userRepo.findOne({ where: { id } });
    }
    async deleteUser(id) {
        await this.userRepo.delete(id);
    }
    async getAllConfigs() {
        return this.configRepo.find();
    }
};
exports.MasterDataService = MasterDataService;
exports.MasterDataService = MasterDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(agent_master_entity_1.AgentMaster)),
    __param(1, (0, typeorm_1.InjectRepository)(portal_user_entity_1.PortalUser)),
    __param(2, (0, typeorm_1.InjectRepository)(system_config_entity_1.SystemConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MasterDataService);
//# sourceMappingURL=master-data.service.js.map