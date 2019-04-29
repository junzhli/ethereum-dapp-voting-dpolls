import { BlockHeightType, AddressType } from "../../actions/types/eth";
import { Membership } from "../../types";

export interface IEthMisc {
    blockHeight: BlockHeightType,
    accountAddress: AddressType | null,
    membership: Membership | null
}

export interface StoreState {
    ethMisc: IEthMisc
}