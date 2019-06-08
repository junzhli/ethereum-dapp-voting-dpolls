import { SET_POLL_STATISTICS, REMOVE_MONITORING_POLLS, ADD_MONITORING_POLLS, SET_USER_SEARCH_KEYWORDS, SET_SEARCH_RESULTS_AMOUNT, SET_ACTIVE_POLL_DETAIL, SET_ACTIVE_POLL_DETAIL_IN_PROGRESS } from "./constant";
import { ISetStatistics, IAddMonitoringPolls, IRemoveMonitoringPolls, ISetUserSearchKeywords, ISetSearchResultsAmount, ISetActivePollDetail, ISetActivePollDetailInProgress } from "./types/poll";
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

export const setUserSearchKeywords = (keywords: string | null): ISetUserSearchKeywords => {
    return {
        type: SET_USER_SEARCH_KEYWORDS,
        payload: keywords,
    };
};

export const setSearchResultsAmount = (amount: number | null): ISetSearchResultsAmount => {
    return {
        type: SET_SEARCH_RESULTS_AMOUNT,
        payload: amount,
    };
};

export const setActivePollDetail = (address: AddressType | null, index?: number): ISetActivePollDetail => {
    return {
        type: SET_ACTIVE_POLL_DETAIL,
        payload: {
            address,
            index,
        },
    };
};

export const setActivePollDetailInProgress = (inProgress: boolean): ISetActivePollDetailInProgress => {
    return {
        type: SET_ACTIVE_POLL_DETAIL_IN_PROGRESS,
        payload: inProgress,
    };
};
