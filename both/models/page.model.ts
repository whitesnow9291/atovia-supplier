import { CollectionObject } from "./collection-object.model";

export interface Page extends CollectionObject {
    ownerId: string;
    title: string;
    heading: string;
    summary: string;
    contents: string;
    slug: string;
    active: boolean;
    deleted: boolean;
    createdAt: Date;
    modifiedAt: Date;
}
