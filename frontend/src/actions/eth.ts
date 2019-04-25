import { BlockHeightType, ISetBlockHeight } from "./types/eth";
import { SET_BLOCK_HEIGHT } from "./constant";

export const setBlockHeight = (blockHeight: BlockHeightType): ISetBlockHeight => {
    return {
        type: SET_BLOCK_HEIGHT,
        payload: blockHeight
    }
}