import { MasterDataService } from './master-data.service';
export declare class MasterDataController {
    private svc;
    constructor(svc: MasterDataService);
    findAgents(query: any): Promise<{
        items: import("../entities").AgentMaster[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAgent(code: string): Promise<import("../entities").AgentMaster>;
    updateAgent(code: string, body: any): Promise<import("../entities").AgentMaster>;
    getThreshold(): Promise<{
        value: number;
        description: string;
    }>;
    updateThreshold(body: {
        value: number;
    }, req: any): Promise<void>;
    findAllUsers(): Promise<import("../entities").PortalUser[]>;
    updateUser(id: string, body: any): Promise<import("../entities").PortalUser>;
    deleteUser(id: string): Promise<void>;
    getAllConfigs(): Promise<import("../entities").SystemConfig[]>;
}
