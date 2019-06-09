import { SET_POLL_STATISTICS, SET_USER_SEARCH_KEYWORDS, SET_SEARCH_RESULTS_AMOUNT, SET_ACTIVE_POLL_DETAIL, SET_ACTIVE_POLL_DETAIL_IN_PROGRESS, ADD_MONITORING_CREATED_POLLS, REMOVE_MONITORING_CREATED_POLLS, ADD_MONITORING_VOTED_POLLS, REMOVE_MONITORING_VOTED_POLLS } from "../actions/constant";
import { PollActionType } from "../actions/types/poll";
import { IPollMisc } from "../store/types";
import { AddressType } from "../actions/types/eth";

const initialState: IPollMisc = {
    active: null,
    amount: null,
    monitoring: {
        created: [],
        voted: [],
    },
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
        case ADD_MONITORING_CREATED_POLLS: {
            const created = Object.assign([], state.monitoring.created);
            const addresses = action.payload;
            Array.prototype.push.apply(created, addresses);
            const monitoring = Object.assign(state.monitoring, {
                created,
            });
            return {
                ...state,
                monitoring,
            };
        }
        case REMOVE_MONITORING_CREATED_POLLS: {
            const created = Object.assign([], state.monitoring.created);
            const addresses: AddressType[] = action.payload;
            for (const item of addresses) {
                const atIndex = created.indexOf(item);
                created.splice(atIndex, 1);
            }
            const monitoring = Object.assign(state.monitoring, {
                created,
            });
            return {
                ...state,
                monitoring,
            };
        }
        case ADD_MONITORING_VOTED_POLLS: {
            const voted = Object.assign([], state.monitoring.voted);
            const addresses = action.payload;
            Array.prototype.push.apply(voted, addresses);
            const monitoring = Object.assign(state.monitoring, {
                voted,
            });
            return {
                ...state,
                monitoring,
            };
        }
        case REMOVE_MONITORING_VOTED_POLLS: {
            const voted = Object.assign([], state.monitoring.voted);
            const addresses: AddressType[] = action.payload;
            for (const item of addresses) {
                const atIndex = voted.indexOf(item);
                voted.splice(atIndex, 1);
            }
            const monitoring = Object.assign(state.monitoring, {
                voted,
            });
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
