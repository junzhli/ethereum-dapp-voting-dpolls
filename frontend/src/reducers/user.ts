import { SET_NOTIFICATION_STATUS, SET_SEARCH_BAR, SET_USER_WINDOW_FOCUS_STATUS, SET_LOADING_HINT } from "../actions/constant";
import { IUserMisc } from "../store/types";
import { UserActionType } from "../actions/types/user";

const initialState: IUserMisc = {
    notificationStatus: null,
    searchbarEnabled: false,
    userWindowsFocus: true,
    loadingHintEnabled: false,
};

const user = (state: IUserMisc = initialState, action: UserActionType): IUserMisc => {
    switch (action.type) {
        case SET_NOTIFICATION_STATUS: {
            const notificationStatus = action.payload;
            return {
                ...state,
                notificationStatus,
            };
        }
        case SET_SEARCH_BAR: {
            const searchbarEnabled = action.payload;
            return {
                ...state,
                searchbarEnabled,
            };
        }
        case SET_USER_WINDOW_FOCUS_STATUS: {
            const userWindowsFocus = action.payload;
            return {
                ...state,
                userWindowsFocus,
            };
        }
        case SET_LOADING_HINT: {
            const loadingHintEnabled = action.payload;
            return {
                ...state,
                loadingHintEnabled,
            };
        }
    }

    return state;
};

export default user;
