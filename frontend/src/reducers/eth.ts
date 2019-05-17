import { SET_ACCOUNT_ADDRESS, SET_BLOCK_HEIGHT, SET_MEMBERSHIP } from "../actions/constant";
import { ETHActionType } from "../actions/types/eth";
import { IEthMisc } from "../store/types";

const initialState: IEthMisc = {
    blockHeight: -1,
    accountAddress: null,
    membership: null,
};

const eth = (state: IEthMisc = initialState, action: ETHActionType): IEthMisc => {
    switch (action.type) {
        case SET_BLOCK_HEIGHT: {
            const blockHeight = action.payload;
            return {
                ...state,
                blockHeight,
            };
        }
        case SET_ACCOUNT_ADDRESS: {
            const accountAddress = action.payload;
            return {
                ...state,
                accountAddress,
            };
        }
        case SET_MEMBERSHIP: {
            const membership = action.payload;
            return {
                ...state,
                membership,
            };
        }
    }

    return state;
};

export default eth;
