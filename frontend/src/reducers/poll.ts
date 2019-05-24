import { SET_POLL_STATISTICS, ADD_MONITORING_POLLS, REMOVE_MONITORING_POLLS } from "../actions/constant";
import { PollActionType } from "../actions/types/poll";
import { IPollMisc } from "../store/types";
import { AddressType } from "../actions/types/eth";

const initialState: IPollMisc = {
    active: null,
    amount: null,
    monitoring: [],
};

const poll = (state: IPollMisc = initialState, action: PollActionType): IPollMisc => {
    switch (action.type) {
        case SET_POLL_STATISTICS: {
            const { amount, active } = action.payload;
            return {
                ...state,
                amount,
                active,
            };
        }
        case ADD_MONITORING_POLLS: {
            const monitoring = Object.assign([], state.monitoring);
            const addresses = action.payload;
            Array.prototype.push.apply(monitoring, addresses);

            return {
                ...state,
                monitoring,
            };
        }
        case REMOVE_MONITORING_POLLS: {
            const monitoring = Object.assign([], state.monitoring);
            const addresses: AddressType[] = action.payload;
            for (const item of addresses) {
                const atIndex = monitoring.indexOf(item);
                monitoring.splice(atIndex, 1);
            }
            return {
                ...state,
                monitoring,
            };
        }
    }

    return state;
};

export default poll;
