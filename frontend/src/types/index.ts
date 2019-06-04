import { AddressType } from "../actions/types/eth";

export type Address = string;

export enum Membership {
    NO_BODY = 0,
    CITIZEN = 1,
    DIAMOND = 2,
}

export interface IIndexStates {
    web3: any;
    web3Rpc: any;
    networkChecked: boolean | null;
    approved: boolean | null;
    showUserPrivacyModeDeniedMessage: boolean | null;
    showUserWalletLockedMessage: boolean | null;
    voting: {
        selector: AddressType | null,
    };
}
