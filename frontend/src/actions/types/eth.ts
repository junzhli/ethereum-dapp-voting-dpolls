import { SET_BLOCK_HEIGHT, SET_ACCOUNT_ADDRESS } from "../constant";

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

export type ETHActionType = ISetBlockHeight | ISetAccountAddress;