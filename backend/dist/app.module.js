"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./auth/auth.module");
const payment_requests_module_1 = require("./payment-requests/payment-requests.module");
const master_data_module_1 = require("./master-data/master-data.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const entities_1 = require("./entities");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER || 'pil_admin',
                password: process.env.DB_PASS || 'Password123!',
                database: process.env.DB_NAME || 'pil_portal_db',
                entities: [entities_1.AgentMaster, entities_1.PortalUser, entities_1.PaymentRequest, entities_1.Notification, entities_1.SystemConfig, entities_1.AuditLog],
                synchronize: false,
                logging: false,
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
            auth_module_1.AuthModule,
            payment_requests_module_1.PaymentRequestsModule,
            master_data_module_1.MasterDataModule,
            notifications_module_1.NotificationsModule,
            audit_log_module_1.AuditLogModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map