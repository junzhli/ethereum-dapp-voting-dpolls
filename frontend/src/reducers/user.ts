import { SET_NOTIFICATION_STATUS, SET_SEARCH_BAR, SET_USER_WINDOW_FOCUS_STATUS } from "../actions/constant";
import { IUserMisc } from "../store/types";
import { UserActionType } from "../actions/types/user";

const initialState: IUserMisc = {
    notificationStatus: null,
    searchbarEnabled: false,
    userWindowsFocus: true,
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
    }

    return state;
};

export default user;
