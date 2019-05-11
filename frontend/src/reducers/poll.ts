import { IEthMisc, IPollMisc } from "../store/types";
import { ETHActionType } from "../actions/types/eth";
import { SET_BLOCK_HEIGHT, SET_ACCOUNT_ADDRESS, SET_MEMBERSHIP, SET_POLL_STATISTICS } from "../actions/constant";
import { Action } from "redux";
import { PollActionType } from "../actions/types/poll";

const initialState: IPollMisc = {
    active: null,
    amount: null
}

const poll = (state: IPollMisc = initialState, action: PollActionType): IPollMisc => {
    switch (action.type) {
        case SET_POLL_STATISTICS: {
            const { amount, active } = action.payload;
            return {
                ...state,
                amount,
                active
            }
        }
    }

    return state;
}

export default poll;
