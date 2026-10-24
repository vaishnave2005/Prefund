import { Repository } from 'typeorm';
import { AgentMaster } from '../entities/agent-master.entity';
import { PortalUser } from '../entities/portal-user.entity';
import { SystemConfig } from '../entities/system-config.entity';
export declare class MasterDataService {
    private agentRepo;
    private userRepo;
    private configRepo;
    constructor(agentRepo: Repository<AgentMaster>, userRepo: Repository<PortalUser>, configRepo: Repository<SystemConfig>);
    findAgents(query: any): Promise<{
        items: AgentMaster[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAgent(code: string): Promise<AgentMaster>;
    updateAgent(code: string, data: Partial<AgentMaster>): Promise<AgentMaster>;
    getThreshold(): Promise<{
        value: number;
        description: string;
    }>;
    updateThreshold(value: number, actorId: string): Promise<void>;
    findAllUsers(): Promise<PortalUser[]>;
    createUser(data: Partial<PortalUser>): Promise<PortalUser>;
    updateUser(id: string, data: Partial<PortalUser>): Promise<PortalUser>;
    deleteUser(id: string): Promise<void>;
    getAllConfigs(): Promise<SystemConfig[]>;
}
