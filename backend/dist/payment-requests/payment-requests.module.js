"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_requests_controller_1 = require("./payment-requests.controller");
const payment_requests_service_1 = require("./payment-requests.service");
const entities_1 = require("../entities");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let PaymentRequestsModule = class PaymentRequestsModule {
};
exports.PaymentRequestsModule = PaymentRequestsModule;
exports.PaymentRequestsModule = PaymentRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.PaymentRequest, entities_1.AgentMaster, entities_1.Notification, entities_1.AuditLog, entities_1.SystemConfig]),
            platform_express_1.MulterModule.register({
                storage: (0, multer_1.diskStorage)({
                    destination: (0, path_1.join)(process.cwd(), 'uploads'),
                    filename: (req, file, cb) => {
                        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                        cb(null, uniqueSuffix + (0, path_1.extname)(file.originalname));
                    },
                }),
            }),
        ],
        controllers: [payment_requests_controller_1.PaymentRequestsController],
        providers: [payment_requests_service_1.PaymentRequestsService],
        exports: [payment_requests_service_1.PaymentRequestsService],
    })
], PaymentRequestsModule);
//# sourceMappingURL=payment-requests.module.js.map