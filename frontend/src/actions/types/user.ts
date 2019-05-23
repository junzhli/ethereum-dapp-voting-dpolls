import { SET_NOTIFICATION_STATUS } from "../constant";

export interface ISetNotificationStatus {
    type: typeof SET_NOTIFICATION_STATUS;
    payload: boolean;
}

export type UserActionType = ISetNotificationStatus;
