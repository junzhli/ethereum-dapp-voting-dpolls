import { SET_POLL_STATISTICS, SET_USER_SEARCH_KEYWORDS, SET_SEARCH_RESULTS_AMOUNT, SET_ACTIVE_POLL_DETAIL, SET_ACTIVE_POLL_DETAIL_IN_PROGRESS, ADD_MONITORING_CREATED_POLLS, REMOVE_MONITORING_CREATED_POLLS, ADD_MONITORING_VOTED_POLLS, REMOVE_MONITORING_VOTED_POLLS, SET_VOTE_IN_PROGRESS, REMOVE_VOTE_IN_PROGRESS } from "./constant";
import { ISetStatistics, ISetUserSearchKeywords, ISetSearchResultsAmount, ISetActivePollDetail, ISetActivePollDetailInProgress, IAddMonitoringCreatedPolls, IRemoveMonitoringCreatedPolls, IAddMonitoringVotedPolls, IRemoveMonitoringVotedPolls, ISetVoteInProgress, IRemoveVoteInProgress } from "./types/poll";
import { AddressType, BlockHeightType } from "./types/eth";

export const setStatistics = (amount: number, active: number): ISetStatistics => {
    return {
        type: SET_POLL_STATISTICS,
        payload: {
            amount,
            active,
        },
    };
};

export const addMonitoringCreatedPoll = (addresses: AddressType[]): IAddMonitoringCreatedPolls => {
    return {
        type: ADD_MONITORING_CREATED_POLLS,
        payload: addresses,
    };
};

export const removeMonitoringCreatedPoll = (addresses: AddressType[]): IRemoveMonitoringCreatedPolls => {
    return {
        type: REMOVE_MONITORING_CREATED_POLLS,
        payload: addresses,
    };
};

export const addMonitoringVotedPoll = (addresses: AddressType[]): IAddMonitoringVotedPolls => {
    return {
        type: ADD_MONITORING_VOTED_POLLS,
        payload: addresses,
    };
};

export const removeMonitoringVotedPoll = (addresses: AddressType[]): IRemoveMonitoringVotedPolls => {
    return {
        type: REMOVE_MONITORING_VOTED_POLLS,
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

export const setVoteInProgress = (address: AddressType, txid: string, votedIndex: number): ISetVoteInProgress => {
    return {
        type: SET_VOTE_IN_PROGRESS,
        payload: {
            address,
            txid,
            votedIndex,
        },
    };
};

export const removeVoteInProgress = (address: AddressType): IRemoveVoteInProgress => {
    return {
        type: REMOVE_VOTE_IN_PROGRESS,
        payload: address,
    };
};
