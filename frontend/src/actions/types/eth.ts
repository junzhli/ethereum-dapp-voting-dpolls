import { Address, Membership } from "../../types";
import { SET_ACCOUNT_ADDRESS, SET_BLOCK_HEIGHT, SET_MEMBERSHIP } from "../constant";

export type BlockHeightType = number;
export type AddressType = Address;

export interface ISetBlockHeight {
    type: typeof SET_BLOCK_HEIGHT;
    payload: BlockHeightType;
}

export interface ISetAccountAddress {
    type: typeof SET_ACCOUNT_ADDRESS;
    payload: AddressType;
}

export interface ISetMembership {
    type: typeof SET_MEMBERSHIP;
    payload: Membership;
}

export type ETHActionType = ISetBlockHeight | ISetAccountAddress | ISetMembership;
