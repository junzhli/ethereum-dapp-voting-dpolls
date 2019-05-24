import { BlockHeightType, AddressType } from "../../actions/types/eth";

export namespace IMainListingPoll {
    export interface IInnerProps {
        web3: any;
    }

    export interface IStateFromProps {
        blockHeight: BlockHeightType;
        monitoring: AddressType[];
        notificationStatus: boolean | null;
    }

    export interface IPropsFromDispatch {
        setPollStatistics: (amount: number, active: number) => void;
        removeMonitoringPolls: (addresses: AddressType[]) => void;
    }
}

export type IMainListingPollProps = IMainListingPoll.IInnerProps & IMainListingPoll.IStateFromProps & IMainListingPoll.IPropsFromDispatch;

export interface PollInitialMetadata {
    address: string;
    isExpired: boolean;
    expiryBlockNumber: number;
    contract: any;
}
export interface IMainListingPollState {
    amountPolls: number | null;
    inactivePolls: PollInitialMetadata[] | null;
    activePolls: PollInitialMetadata[] | null;
    inactiveCollapse: boolean;
    activeCollapse: boolean;
}
