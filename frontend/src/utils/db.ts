import Dexie from "dexie";

const dbname = "dpolls";

/**
 * DB schema
 */
export interface IListing {
    index: number;
    address: string;
    expiryBlockNumber: number;
}

export interface IDetail {
    address: string;
    chairperson: string;
    title: string;
    amountOptions: number;
}

export interface IOptions {
    address: string;
    index: number;
    option: string;
}

/**
 * Database
 */
class DB extends Dexie {
    listing: Dexie.Table<IListing, number>;
    detail: Dexie.Table<IDetail, string>;
    options: Dexie.Table<IOptions, { address: string, index: number }>;

    constructor() {
        super(dbname);
        this.version(1).stores({
            listing: "&index,address,expiryBlockNumber",
            detail: "&address,chairperson,title,amountOptions",
            options: "[address+index],option",
        });

        this.listing = this.table("listing");
        this.detail = this.table("detail");
        this.options = this.table("options");
      }
}

export const DBInstance = new DB();
