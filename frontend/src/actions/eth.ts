import { BlockHeightType, ISetBlockHeight, AddressType, ISetAccountAddress, ISetMembership } from "./types/eth";
import { SET_BLOCK_HEIGHT, SET_ACCOUNT_ADDRESS, SET_MEMBERSHIP } from "./constant";
import { Membership } from "../types";

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

export const setMembership = (nextMembership: Membership): ISetMembership => {
    return {
        type: SET_MEMBERSHIP,
        payload: nextMembership
    }
}
