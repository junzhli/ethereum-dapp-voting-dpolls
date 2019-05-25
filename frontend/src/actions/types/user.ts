import { SET_NOTIFICATION_STATUS, SET_SEARCH_BAR } from "../constant";

export interface ISetNotificationStatus {
    type: typeof SET_NOTIFICATION_STATUS;
    payload: boolean;
}

export interface ISetSearchBar {
    type: typeof SET_SEARCH_BAR;
    payload: boolean;
}

export type UserActionType = ISetNotificationStatus | ISetSearchBar;
