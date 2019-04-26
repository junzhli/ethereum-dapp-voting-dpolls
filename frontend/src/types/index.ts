import { any } from "prop-types";
import { AddressType } from "../actions/types/eth";

export type Address = string;

export interface IIndexStates {
    web3: any;
    approved: boolean;
    voting: {
        selector: AddressType | null
    }
}