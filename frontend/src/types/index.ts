import { any } from "prop-types";
import { AddressType } from "../actions/types/eth";

export type Address = string;

export enum Membership {
    NO_BODY = 0,
    CITIZEN = 1,
    DIAMOND = 2,
}

export interface IIndexStates {
    web3: any;
    approved: boolean;
    showUserPrivacyModeDeniedMessage: boolean;
    showUserWalletLockedMessage: boolean;
    voting: {
        selector: AddressType | null,
    };
}
