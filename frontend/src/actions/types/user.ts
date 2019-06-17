import { SET_NOTIFICATION_STATUS, SET_SEARCH_BAR, SET_USER_WINDOW_FOCUS_STATUS, SET_LOADING_HINT } from "../constant";

export interface ISetNotificationStatus {
    type: typeof SET_NOTIFICATION_STATUS;
    payload: boolean;
}

export interface ISetSearchBar {
    type: typeof SET_SEARCH_BAR;
    payload: boolean;
}

export interface ISetUserIsFocus {
    type: typeof SET_USER_WINDOW_FOCUS_STATUS;
    payload: boolean;
}

export interface ISetLoadingHint {
    type: typeof SET_LOADING_HINT;
    payload: boolean;
}

export type UserActionType = ISetNotificationStatus | ISetSearchBar | ISetUserIsFocus | ISetLoadingHint;
