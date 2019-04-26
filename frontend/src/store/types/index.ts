import { BlockHeightType, AddressType } from "../../actions/types/eth";

export interface IEthMisc {
    blockHeight: BlockHeightType,
    accountAddress: AddressType | null
}

export interface StoreState {
    ethMisc: IEthMisc
}