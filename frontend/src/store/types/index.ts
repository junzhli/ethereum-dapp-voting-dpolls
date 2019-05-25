import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { Membership } from "../../types";

export interface IEthMisc {
    blockHeight: BlockHeightType;
    accountAddress: AddressType | null;
    membership: Membership | null;
}

export interface IPollMisc {
    active: number | null;
    amount: number | null;
    monitoring: string[];
    keywords: string | null;
    searchResultsAmount: number | null;
}

export interface IUserMisc {
    notificationStatus: boolean | null;
    searchbarEnabled: boolean;
}

export interface StoreState {
    ethMisc: IEthMisc;
    pollMisc: IPollMisc;
    userMisc: IUserMisc;
}
