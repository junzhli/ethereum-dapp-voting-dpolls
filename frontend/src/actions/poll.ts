import { SET_POLL_STATISTICS, REMOVE_MONITORING_POLLS, ADD_MONITORING_POLLS } from "./constant";
import { ISetStatistics, IAddMonitoringPolls, IRemoveMonitoringPolls } from "./types/poll";
import { AddressType } from "./types/eth";

export const setStatistics = (amount: number, active: number): ISetStatistics => {
    return {
        type: SET_POLL_STATISTICS,
        payload: {
            amount,
            active,
        },
    };
};

export const addMonitoringPoll = (addresses: AddressType[]): IAddMonitoringPolls => {
    return {
        type: ADD_MONITORING_POLLS,
        payload: addresses,
    };
};

export const removeMonitoringPoll = (addresses: AddressType[]): IRemoveMonitoringPolls => {
    return {
        type: REMOVE_MONITORING_POLLS,
        payload: addresses,
    };
};
