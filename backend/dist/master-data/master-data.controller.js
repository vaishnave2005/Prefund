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
exports.MasterDataController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const master_data_service_1 = require("./master-data.service");
let MasterDataController = class MasterDataController {
    constructor(svc) {
        this.svc = svc;
    }
    findAgents(query) { return this.svc.findAgents(query); }
    findAgent(code) { return this.svc.findAgent(code); }
    updateAgent(code, body) { return this.svc.updateAgent(code, body); }
    getThreshold() { return this.svc.getThreshold(); }
    updateThreshold(body, req) { return this.svc.updateThreshold(body.value, req.user.fullName); }
    findAllUsers() { return this.svc.findAllUsers(); }
    updateUser(id, body) { return this.svc.updateUser(id, body); }
    deleteUser(id) { return this.svc.deleteUser(id); }
    getAllConfigs() { return this.svc.getAllConfigs(); }
};
exports.MasterDataController = MasterDataController;
__decorate([
    (0, common_1.Get)('master-data/agents'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "findAgents", null);
__decorate([
    (0, common_1.Get)('master-data/agents/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "findAgent", null);
__decorate([
    (0, common_1.Put)('master-data/agents/:code'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "updateAgent", null);
__decorate([
    (0, common_1.Get)('config/threshold'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "getThreshold", null);
__decorate([
    (0, common_1.Put)('config/threshold'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "updateThreshold", null);
__decorate([
    (0, common_1.Get)('admin/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "findAllUsers", null);
__decorate([
    (0, common_1.Put)('admin/users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('admin/users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MasterDataController.prototype, "getAllConfigs", null);
exports.MasterDataController = MasterDataController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [master_data_service_1.MasterDataService])
], MasterDataController);
//# sourceMappingURL=master-data.controller.js.map