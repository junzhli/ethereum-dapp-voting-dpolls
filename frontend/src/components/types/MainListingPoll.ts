import { BlockHeightType, AddressType } from "../../actions/types/eth";
import { RouteComponentProps } from "react-router-dom";

export namespace IMainListingPoll {
    export interface IInnerProps {
        web3: any;
        web3Rpc: any;
    }

    export interface IStateFromProps {
        blockHeight: BlockHeightType;
        monitoring: {
            created: string[],
            voted: string[],
        };
        notificationStatus: boolean | null;
        userSearchKeywords: string | null;
        userWindowFocus: boolean;
        activeDetailAddress: {
            address: AddressType | null;
            index: number | null;
        };
        accountAddress: AddressType | null;
    }

    export interface IPropsFromDispatch {
        setPollStatistics: (amount: number, active: number) => void;
        removeMonitoringCreatedPolls: (addresses: AddressType[]) => void;
        removeMonitoringVotedPoll: (address: AddressType) => void;
        setSearchResultsAmount: (amount: number | null) => void;
        setSearchBar: (enabled: boolean) => void;
        setActiveDetailAddress: (address: AddressType | null, index?: number) => void;
        setActiveDetailViewInProgress: (inProgress: boolean) => void;
    }
}

export type IMainListingPollProps = RouteComponentProps<{}> & IMainListingPoll.IInnerProps & IMainListingPoll.IStateFromProps & IMainListingPoll.IPropsFromDispatch;

export interface PollInitialMetadata {
    address: string;
    isExpired: boolean;
    expiryBlockNumber: number;
    contract: any;
}
export interface IMainListingPollState {
    amountPolls: number | null;
    polls: PollInitialMetadata[] | null;
    inactivePolls: PollInitialMetadata[] | null;
    activePolls: PollInitialMetadata[] | null;
    filteredPolls: AddressType[] | null;
    filteredView: FilteredViewOptions;
    showDetailView: {
        web3: any;
        web3Rpc: any;
        contract: any;
        address: AddressType;
        title: string;
        options: string[];
        expiryBlockHeight: BlockHeightType;
        isExpired: boolean;
        isVoted: boolean | null;
        votesAmount: number;
    } | null;
}

export type FilteredViewOptions = "all" | "active" | "inactive";

export interface AdditionalData {
    contractAddress: AddressType;
    chairperson: AddressType;
    title: string;
}
