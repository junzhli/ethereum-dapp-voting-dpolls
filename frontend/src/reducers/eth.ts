import { IEthMisc } from "../store/types";
import { ETHActionType } from "../actions/types/eth";
import { SET_BLOCK_HEIGHT } from "../actions/constant";

const initialState: IEthMisc = {
    blockHeight: -1
}

const eth = (state: IEthMisc = initialState, action: ETHActionType): IEthMisc => {
    switch (action.type) {
        case SET_BLOCK_HEIGHT: {
            const blockHeight = action.payload;
            return {
                ...state,
                blockHeight
            }
        }
    }

    return state;
}

export default eth;
