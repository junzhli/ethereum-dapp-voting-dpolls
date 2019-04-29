import { SET_BLOCK_HEIGHT, SET_ACCOUNT_ADDRESS, SET_MEMBERSHIP } from "../constant";
import { IMainBanner } from "../../components/types/MainBanner";
import { Membership } from "../../types";

export type BlockHeightType = number;
export type AddressType = string;

export interface ISetBlockHeight {
    type: typeof SET_BLOCK_HEIGHT,
    payload: BlockHeightType
};

export interface ISetAccountAddress {
    type: typeof SET_ACCOUNT_ADDRESS,
    payload: AddressType
};

export interface ISetMembership {
    type: typeof SET_MEMBERSHIP,
    payload: Membership
}

export type ETHActionType = ISetBlockHeight | ISetAccountAddress | ISetMembership;