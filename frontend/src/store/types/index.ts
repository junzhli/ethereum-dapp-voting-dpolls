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
    activeDetailAddress: {
        address: AddressType | null;
        index: number | null;
        inProgress: boolean;
    };
}

export interface IUserMisc {
    notificationStatus: boolean | null;
    searchbarEnabled: boolean;
    userWindowsFocus: boolean;
}

export interface StoreState {
    ethMisc: IEthMisc;
    pollMisc: IPollMisc;
    userMisc: IUserMisc;
}
