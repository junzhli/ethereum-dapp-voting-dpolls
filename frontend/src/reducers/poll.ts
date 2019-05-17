import { SET_POLL_STATISTICS } from "../actions/constant";
import { PollActionType } from "../actions/types/poll";
import { IPollMisc } from "../store/types";

const initialState: IPollMisc = {
    active: null,
    amount: null,
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
    }

    return state;
};

export default poll;
