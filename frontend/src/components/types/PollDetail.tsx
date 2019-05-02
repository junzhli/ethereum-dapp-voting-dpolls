import { BlockHeightType, AddressType } from "../../actions/types/eth";

export namespace IPollDetail {
    export interface IInnerProps {
        web3: any;
        contract: any;
        address: AddressType;
        title: string;
        options: string[];
        expiryBlockHeight: BlockHeightType;
        isExpired: boolean;
        isVoted: boolean;
    }
    
    export interface IStateFromProps {
        accountAddress: AddressType | null;
    }
}

export type IPollDetailProps = IPollDetail.IInnerProps & IPollDetail.IStateFromProps;

export interface IPollDetailStates {
    waitingMessage: {
        show: boolean,
        message: string | null
    };
    errorMessage: {
        show: boolean,
        message: string | null
    };
    votingMessage: {
        selectedIndex: number | null,
        selectedOption: string | null
    };
    successfulMessage: {
        show: boolean
    };
    votedOption: number | null;
}
