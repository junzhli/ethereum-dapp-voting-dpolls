import { SET_POLL_STATISTICS } from "./constant";
import { ISetStatistics } from "./types/poll";

export const setStatistics = (amount: number, active: number): ISetStatistics => {
    return {
        type: SET_POLL_STATISTICS,
        payload: {
            amount,
            active,
        },
    };
};
