import { SET_NOTIFICATION_STATUS } from "./constant";
import { ISetNotificationStatus } from "./types/user";

export const setNotificationStatus = (status: boolean): ISetNotificationStatus => {
    return {
        type: SET_NOTIFICATION_STATUS,
        payload: status,
    };
};
