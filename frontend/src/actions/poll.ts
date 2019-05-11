import { BlockHeightType, ISetBlockHeight, AddressType, ISetAccountAddress, ISetMembership } from "./types/eth";
import { SET_BLOCK_HEIGHT, SET_ACCOUNT_ADDRESS, SET_MEMBERSHIP, SET_POLL_STATISTICS } from "./constant";
import { Membership } from "../types";
import { ISetStatistics } from "./types/poll";

export const setStatistics = (amount: number, active: number): ISetStatistics => {
    return {
        type: SET_POLL_STATISTICS,
        payload: {
            amount,
            active
        }
    }
}
