import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { PortalUser, UserRole } from '../entities/portal-user.entity';
import { SystemConfig } from '../entities/system-config.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'pil_admin',
  password: 'Password123!',
  database: 'pil_portal_db',
  entities: [PortalUser, SystemConfig],
  synchronize: false,
});

async function seed() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(PortalUser);
  const configRepo = dataSource.getRepository(SystemConfig);

  const hash = await bcrypt.hash('Password123!', 10);

  const demoUsers = [
    { userId: 'AGENT001', email: 'agent@pil.com', fullName: 'Demo Agent User', role: UserRole.AGENT, assignedOfficeCode: 'PIL_NIG', isDemoUser: true },
    { userId: 'GFSU001', email: 'gfsu@pil.com', fullName: 'Sarah Chen (GFSU)', role: UserRole.GFSU_AC, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
    { userId: 'CAC001', email: 'cac@pil.com', fullName: 'Marcus Lee (CAC)', role: UserRole.CAC, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
    { userId: 'TREAS001', email: 'treasury@pil.com', fullName: 'Priya Nair (Treasury)', role: UserRole.TREASURY, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
    { userId: 'SGAP001', email: 'sgap@pil.com', fullName: 'James Tan (SG AP)', role: UserRole.SG_AP, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
    { userId: 'ADMIN001', email: 'admin@pil.com', fullName: 'System Administrator', role: UserRole.ADMIN, assignedOfficeCode: 'PIL_HQ', isDemoUser: true },
  ];

  for (const u of demoUsers) {
    const existing = await userRepo.findOne({ where: { email: u.email } });
    if (!existing) {
      await userRepo.save(userRepo.create({ ...u, passwordHash: hash }));
      console.log(`Created user: ${u.email}`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }

  // Upsert system config
  await configRepo.upsert([
    { configKey: 'tier_threshold_usd', configValue: '500000', description: 'Treasury execution tier threshold (USD). Tier 1 < $500K, Tier 2 >= $500K' },
    { configKey: 'portal_version', configValue: '1.0.0', description: 'PIL Portal version' },
  ], ['configKey']);
  console.log('System config seeded.');

  await dataSource.destroy();
  console.log('Seed complete.');
}

seed().catch(console.error);
