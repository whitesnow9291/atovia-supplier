import { CollectionObject } from "./collection-object.model";

export interface Payout extends CollectionObject {
    supplierId: string;
    amount: number;
    fromDate: Date;
    toDate: Date;
    title: string;
    status: string;
    createdAt: Date;
    modifiedAt: Date;
};
