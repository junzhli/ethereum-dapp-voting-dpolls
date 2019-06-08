import { SET_POLL_STATISTICS, ADD_MONITORING_POLLS, REMOVE_MONITORING_POLLS, SET_USER_SEARCH_KEYWORDS, SET_SEARCH_RESULTS_AMOUNT, SET_ACTIVE_POLL_DETAIL, SET_ACTIVE_POLL_DETAIL_IN_PROGRESS } from "../constant";
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

export interface ISetUserSearchKeywords {
    type: typeof SET_USER_SEARCH_KEYWORDS;
    payload: string | null;
}

export interface ISetSearchResultsAmount {
    type: typeof SET_SEARCH_RESULTS_AMOUNT;
    payload: number | null;
}

export interface ISetActivePollDetail {
    type: typeof SET_ACTIVE_POLL_DETAIL;
    payload: {
        address: AddressType | null,
        index?: number,
    };
}

export interface ISetActivePollDetailInProgress {
    type: typeof SET_ACTIVE_POLL_DETAIL_IN_PROGRESS;
    payload: boolean;
}

export type PollActionType = ISetStatistics | IAddMonitoringPolls | IRemoveMonitoringPolls | ISetUserSearchKeywords | ISetSearchResultsAmount | ISetActivePollDetail | ISetActivePollDetailInProgress;
