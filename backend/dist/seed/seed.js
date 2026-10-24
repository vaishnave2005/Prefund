"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const portal_user_entity_1 = require("../entities/portal-user.entity");
const system_config_entity_1 = require("../entities/system-config.entity");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'pil_admin',
    password: 'Password123!',
    database: 'pil_portal_db',
    entities: [portal_user_entity_1.PortalUser, system_config_entity_1.SystemConfig],
    synchronize: false,
});
async function seed() {
    await dataSource.initialize();
    const userRepo = dataSource.getRepository(portal_user_entity_1.PortalUser);
    const configRepo = dataSource.getRepository(system_config_entity_1.SystemConfig);
    const hash = await bcrypt.hash('Password123!', 10);
    const demoUsers = [
        { userId: 'AGENT001', email: 'agent@pil.com', fullName: 'Demo Agent User', role: portal_user_entity_1.UserRole.AGENT, assignedOfficeCode: 'PIL_NIG', isDemoUser: true },
        { userId: 'GFSU001', email: 'gfsu@pil.com', fullName: 'Sarah Chen (GFSU)', role: portal_user_entity_1.UserRole.GFSU_AC, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
        { userId: 'CAC001', email: 'cac@pil.com', fullName: 'Marcus Lee (CAC)', role: portal_user_entity_1.UserRole.CAC, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
        { userId: 'TREAS001', email: 'treasury@pil.com', fullName: 'Priya Nair (Treasury)', role: portal_user_entity_1.UserRole.TREASURY, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
        { userId: 'SGAP001', email: 'sgap@pil.com', fullName: 'James Tan (SG AP)', role: portal_user_entity_1.UserRole.SG_AP, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
        { userId: 'ADMIN001', email: 'admin@pil.com', fullName: 'System Administrator', role: portal_user_entity_1.UserRole.ADMIN, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
    ];
    for (const u of demoUsers) {
        const existing = await userRepo.findOne({ where: { email: u.email } });
        if (!existing) {
            await userRepo.save(userRepo.create({ ...u, passwordHash: hash }));
            console.log(`Created user: ${u.email}`);
        }
        else {
            console.log(`User already exists: ${u.email}`);
        }
    }
    await configRepo.upsert([
        { configKey: 'tier_threshold_usd', configValue: '500000', description: 'Treasury execution tier threshold (USD). Tier 1 < $500K, Tier 2 >= $500K' },
        { configKey: 'portal_version', configValue: '1.0.0', description: 'PIL Portal version' },
    ], ['configKey']);
    console.log('System config seeded.');
    await dataSource.destroy();
    console.log('Seed complete.');
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map