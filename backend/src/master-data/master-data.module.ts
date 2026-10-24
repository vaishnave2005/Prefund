import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataController } from './master-data.controller';
import { MasterDataService } from './master-data.service';
import { AgentMaster, PortalUser, SystemConfig } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([AgentMaster, PortalUser, SystemConfig])],
  controllers: [MasterDataController],
  providers: [MasterDataService],
})
export class MasterDataModule {}
