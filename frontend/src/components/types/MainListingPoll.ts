import { Address } from "../../types";
import { BlockHeightType, AddressType } from "../../actions/types/eth";


export namespace IMainListingPoll {
    export interface IInnerProps {
        web3: any;
    }
    
    export interface IStateFromProps {
        blockHeight: BlockHeightType;
    }
    
    export interface IPropsFromDispatch {
        setPollStatistics: (amount: number, active: number) => void;
    }
}

export type IMainListingPollProps = IMainListingPoll.IInnerProps & IMainListingPoll.IStateFromProps & IMainListingPoll.IPropsFromDispatch;

export interface PollIntitalMetadata {
    address: string;
    isExpired: boolean;
    expiryBlockNumber: number;
    contract: any;
}
export interface IMainListingPollState {
    amountPolls: number | null;
    inactivePolls: PollIntitalMetadata[] | null;
    activePolls: PollIntitalMetadata[] | null;
}
