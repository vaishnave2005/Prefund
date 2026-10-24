"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLog = exports.SystemConfig = exports.Notification = exports.PaymentRequest = exports.UserRole = exports.PortalUser = exports.AgentMaster = void 0;
var agent_master_entity_1 = require("./agent-master.entity");
Object.defineProperty(exports, "AgentMaster", { enumerable: true, get: function () { return agent_master_entity_1.AgentMaster; } });
var portal_user_entity_1 = require("./portal-user.entity");
Object.defineProperty(exports, "PortalUser", { enumerable: true, get: function () { return portal_user_entity_1.PortalUser; } });
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return portal_user_entity_1.UserRole; } });
var payment_request_entity_1 = require("./payment-request.entity");
Object.defineProperty(exports, "PaymentRequest", { enumerable: true, get: function () { return payment_request_entity_1.PaymentRequest; } });
var notification_entity_1 = require("./notification.entity");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return notification_entity_1.Notification; } });
var system_config_entity_1 = require("./system-config.entity");
Object.defineProperty(exports, "SystemConfig", { enumerable: true, get: function () { return system_config_entity_1.SystemConfig; } });
var audit_log_entity_1 = require("./audit-log.entity");
Object.defineProperty(exports, "AuditLog", { enumerable: true, get: function () { return audit_log_entity_1.AuditLog; } });
//# sourceMappingURL=index.js.map