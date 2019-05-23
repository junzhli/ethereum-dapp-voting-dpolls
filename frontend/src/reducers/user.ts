import { SET_NOTIFICATION_STATUS } from "../actions/constant";
import { IUserMisc } from "../store/types";
import { UserActionType } from "../actions/types/user";

const initialState: IUserMisc = {
    notificationStatus: null,
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
    }

    return state;
};

export default user;
