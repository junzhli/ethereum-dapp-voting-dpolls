import { SET_POLL_STATISTICS, SET_USER_SEARCH_KEYWORDS, SET_SEARCH_RESULTS_AMOUNT, SET_ACTIVE_POLL_DETAIL, SET_ACTIVE_POLL_DETAIL_IN_PROGRESS, ADD_MONITORING_CREATED_POLLS, ADD_MONITORING_VOTED_POLLS, REMOVE_MONITORING_VOTED_POLLS, REMOVE_MONITORING_CREATED_POLLS, SET_VOTE_IN_PROGRESS, REMOVE_VOTE_IN_PROGRESS } from "../constant";
import { AddressType } from "./eth";

export interface ISetStatistics {
    type: typeof SET_POLL_STATISTICS;
    payload: {
        amount: number,
        active: number,
    };
}

export interface IAddMonitoringCreatedPolls {
    type: typeof ADD_MONITORING_CREATED_POLLS;
    payload: AddressType[];
}

export interface IRemoveMonitoringCreatedPolls {
    type: typeof REMOVE_MONITORING_CREATED_POLLS;
    payload: AddressType[];
}

export interface IAddMonitoringVotedPolls {
    type: typeof ADD_MONITORING_VOTED_POLLS;
    payload: AddressType[];
}

export interface IRemoveMonitoringVotedPolls {
    type: typeof REMOVE_MONITORING_VOTED_POLLS;
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

export interface ISetVoteInProgress {
    type: typeof SET_VOTE_IN_PROGRESS;
    payload: {
        address: AddressType,
        txid: string,
        votedIndex: number,
    };
}

export interface IRemoveVoteInProgress {
    type: typeof REMOVE_VOTE_IN_PROGRESS;
    payload: AddressType;
}

export type PollActionType = ISetStatistics | IAddMonitoringCreatedPolls | IRemoveMonitoringCreatedPolls | IAddMonitoringVotedPolls | IRemoveMonitoringVotedPolls | ISetUserSearchKeywords | ISetSearchResultsAmount | ISetActivePollDetail | ISetActivePollDetailInProgress | ISetVoteInProgress | IRemoveVoteInProgress;
