import { PaymentRequestsService } from './payment-requests.service';
export declare class PaymentRequestsController {
    private svc;
    constructor(svc: PaymentRequestsService);
    create(body: any, req: any, file?: Express.Multer.File): Promise<import("../entities").PaymentRequest>;
    findAll(req: any, query: any): Promise<{
        items: import("../entities").PaymentRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
    getCompleted(query: any): Promise<{
        items: import("../entities").PaymentRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("../entities").PaymentRequest>;
    claim(id: string, req: any): Promise<import("../entities").PaymentRequest>;
    gfsuReview(id: string, body: any, req: any): Promise<import("../entities").PaymentRequest>;
    asaSettlement(body: any, req: any): Promise<import("../entities").PaymentRequest>;
    cacReview(id: string, body: any, req: any): Promise<import("../entities").PaymentRequest>;
    treasuryReview(id: string, body: any, req: any): Promise<import("../entities").PaymentRequest>;
    postTreasuryReview(id: string, body: any, req: any): Promise<import("../entities").PaymentRequest>;
    paymentInitiated(id: string, req: any): Promise<import("../entities").PaymentRequest>;
    executePayment(id: string, body: any, req: any, file?: Express.Multer.File): Promise<import("../entities").PaymentRequest>;
    resubmit(id: string, body: any, req: any): Promise<import("../entities").PaymentRequest>;
    updateLmsEntry(id: string, body: {
        lmsEntry: boolean;
    }, req: any): Promise<import("../entities").PaymentRequest>;
    addDocument(id: string, file: Express.Multer.File, req: any): Promise<import("../entities").PaymentRequest>;
}
