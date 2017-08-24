import { CollectionObject } from "./collection-object.model";

export interface FAQCategory extends CollectionObject {
    ownerId: string;
    title: string;
    summary: string;
    active: boolean;
    deleted: boolean;
    createdAt: Date;
    modifiedAt: Date;
    questionset: any[];
};

export interface FAQ extends CollectionObject {
    ownerId: string;
    categoryId: string;
    question: string;
    answer: string;
    active: boolean;
    deleted: boolean;
    createdAt: Date;
    modifiedAt: Date;
};
