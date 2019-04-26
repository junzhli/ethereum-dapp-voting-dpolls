import { BlockHeightType, ISetBlockHeight, AddressType, ISetAccountAddress } from "./types/eth";
import { SET_BLOCK_HEIGHT, SET_ACCOUNT_ADDRESS } from "./constant";

export const setBlockHeight = (blockHeight: BlockHeightType): ISetBlockHeight => {
    return {
        type: SET_BLOCK_HEIGHT,
        payload: blockHeight
    }
}

export const setAccountAddress = (accountAddress: AddressType): ISetAccountAddress => {
    return {
        type: SET_ACCOUNT_ADDRESS,
        payload: accountAddress
    }
}