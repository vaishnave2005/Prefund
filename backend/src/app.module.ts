import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { PaymentRequestsModule } from './payment-requests/payment-requests.module';
import { MasterDataModule } from './master-data/master-data.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import {
  AgentMaster,
  PortalUser,
  PaymentRequest,
  Notification,
  SystemConfig,
  AuditLog,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'pil_admin',
      password: process.env.DB_PASS || 'Password123!',
      database: process.env.DB_NAME || 'pil_portal_db',
      entities: [AgentMaster, PortalUser, PaymentRequest, Notification, SystemConfig, AuditLog],
      synchronize: false,
      logging: false,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    PaymentRequestsModule,
    MasterDataModule,
    NotificationsModule,
    AuditLogModule,
  ],
})
export class AppModule {}
