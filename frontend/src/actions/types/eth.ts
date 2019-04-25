import { SET_BLOCK_HEIGHT } from "../constant";

export type BlockHeightType = number;

export interface ISetBlockHeight {
    type: typeof SET_BLOCK_HEIGHT,
    payload: BlockHeightType
};

export type ETHActionType = ISetBlockHeight;