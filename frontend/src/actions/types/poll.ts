import { SET_POLL_STATISTICS, ADD_MONITORING_POLLS, REMOVE_MONITORING_POLLS } from "../constant";
import { AddressType } from "./eth";

export interface ISetStatistics {
    type: typeof SET_POLL_STATISTICS;
    payload: {
        amount: number,
        active: number,
    };
}

export interface IAddMonitoringPolls {
    type: typeof ADD_MONITORING_POLLS;
    payload: AddressType[];
}

export interface IRemoveMonitoringPolls {
    type: typeof REMOVE_MONITORING_POLLS;
    payload: AddressType[];
}

export type PollActionType = ISetStatistics | IAddMonitoringPolls | IRemoveMonitoringPolls;
