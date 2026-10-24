import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { AgentMaster } from '../entities/agent-master.entity';
import { PortalUser } from '../entities/portal-user.entity';
import { SystemConfig } from '../entities/system-config.entity';

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(AgentMaster) private agentRepo: Repository<AgentMaster>,
    @InjectRepository(PortalUser) private userRepo: Repository<PortalUser>,
    @InjectRepository(SystemConfig) private configRepo: Repository<SystemConfig>,
  ) {}

  async findAgents(query: any) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '20');
    const search = query.search || '';
    const [items, total] = await this.agentRepo.findAndCount({
      where: search ? [
        { agentCode: ILike(`%${search}%`) },
        { agentName: ILike(`%${search}%`) },
        { country: ILike(`%${search}%`) },
      ] : {},
      order: { agentCode: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findAgent(code: string): Promise<AgentMaster> {
    const agent = await this.agentRepo.findOne({ where: { agentCode: code } });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async updateAgent(code: string, data: Partial<AgentMaster>): Promise<AgentMaster> {
    await this.agentRepo.update(code, data);
    return this.findAgent(code);
  }

  async getThreshold(): Promise<{ value: number; description: string }> {
    const config = await this.configRepo.findOne({ where: { configKey: 'tier_threshold_usd' } });
    return { value: config ? parseFloat(config.configValue) : 500000, description: config?.description || '' };
  }

  async updateThreshold(value: number, actorId: string): Promise<void> {
    await this.configRepo.upsert({ configKey: 'tier_threshold_usd', configValue: String(value), description: `Treasury execution tier threshold (USD). Updated by ${actorId}` }, ['configKey']);
  }

  async findAllUsers(): Promise<PortalUser[]> {
    return this.userRepo.find({ order: { createdAt: 'ASC' } });
  }

  async createUser(data: Partial<PortalUser>): Promise<PortalUser> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateUser(id: string, data: Partial<PortalUser>): Promise<PortalUser> {
    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }

  async getAllConfigs(): Promise<SystemConfig[]> {
    return this.configRepo.find();
  }
}
