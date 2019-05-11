import { SET_BLOCK_HEIGHT, SET_ACCOUNT_ADDRESS, SET_MEMBERSHIP, SET_POLL_STATISTICS } from "../constant";
import { IMainBanner } from "../../components/types/MainBanner";
import { Membership, Address } from "../../types";

export interface ISetStatistics {
    type: typeof SET_POLL_STATISTICS,
    payload: {
        amount: number,
        active: number
    }
};

export type PollActionType = ISetStatistics;