import { SET_NOTIFICATION_STATUS, SET_SEARCH_BAR } from "./constant";
import { ISetNotificationStatus, ISetSearchBar } from "./types/user";

export const setNotificationStatus = (status: boolean): ISetNotificationStatus => {
    return {
        type: SET_NOTIFICATION_STATUS,
        payload: status,
    };
};

export const setSearchBar = (enabled: boolean): ISetSearchBar => {
    return {
        type: SET_SEARCH_BAR,
        payload: enabled,
    };
};
