import { SET_POLL_STATISTICS } from "../constant";

export interface ISetStatistics {
    type: typeof SET_POLL_STATISTICS;
    payload: {
        amount: number,
        active: number,
    };
}

export type PollActionType = ISetStatistics;
