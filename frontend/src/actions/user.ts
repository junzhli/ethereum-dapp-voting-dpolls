import { SET_NOTIFICATION_STATUS, SET_SEARCH_BAR, SET_USER_WINDOW_FOCUS_STATUS } from "./constant";
import { ISetNotificationStatus, ISetSearchBar, ISetUserIsFocus } from "./types/user";

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

export const setUserWindowsFocusStatus = (focus: boolean): ISetUserIsFocus => {
    return {
        type: SET_USER_WINDOW_FOCUS_STATUS,
        payload: focus,
    };
};
