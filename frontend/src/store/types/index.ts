import { BlockHeightType } from "../../actions/types/eth";

export interface IEthMisc {
    blockHeight: BlockHeightType
}

export interface StoreState {
    ethMisc: IEthMisc
}