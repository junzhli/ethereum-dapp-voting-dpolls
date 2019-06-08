import { SET_POLL_STATISTICS, ADD_MONITORING_POLLS, REMOVE_MONITORING_POLLS, SET_USER_SEARCH_KEYWORDS, SET_SEARCH_RESULTS_AMOUNT, SET_ACTIVE_POLL_DETAIL, SET_ACTIVE_POLL_DETAIL_IN_PROGRESS } from "../actions/constant";
import { PollActionType } from "../actions/types/poll";
import { IPollMisc } from "../store/types";
import { AddressType } from "../actions/types/eth";

const initialState: IPollMisc = {
    active: null,
    amount: null,
    monitoring: [],
    keywords: null,
    searchResultsAmount: null,
    activeDetailAddress: {
        address: null,
        index: null,
        inProgress: false,
    },
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
        case SET_USER_SEARCH_KEYWORDS: {
            const keywords = action.payload;
            return {
                ...state,
                keywords,
            };
        }
        case SET_SEARCH_RESULTS_AMOUNT: {
            const searchResultsAmount = action.payload;
            return {
                ...state,
                searchResultsAmount,
            };
        }
        case SET_ACTIVE_POLL_DETAIL: {
            const { address, index } = action.payload;
            const activeDetailAddress = Object.assign(state.activeDetailAddress, {
                address,
                index: (index === undefined) ? null : index,
            });

            return {
                ...state,
                activeDetailAddress,
            };
        }
        case SET_ACTIVE_POLL_DETAIL_IN_PROGRESS: {
            const inProgress = action.payload;
            const activeDetailAddress = Object.assign(state.activeDetailAddress, {
                inProgress,
            });

            return {
                ...state,
                activeDetailAddress,
            };
        }
    }

    return state;
};

export default poll;
