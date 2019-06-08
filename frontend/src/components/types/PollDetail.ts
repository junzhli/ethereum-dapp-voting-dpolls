import { ChartData } from "react-chartjs-2";
import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { RouteComponentProps } from "react-router-dom";

export namespace IPollDetail {
    export interface IInnerProps {
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
    }

    export interface IStateFromProps {
        accountAddress: AddressType | null;
        blockHeight: BlockHeightType;
        activeDetailAddress: AddressType | null;
        activeDetailViewInProgress: boolean;
    }

    export interface IPropsFromDispatch {
        setActiveDetailAddress: (address: AddressType | null) => void;
        setActiveDetailViewInProgress: (inProgress: boolean) => void;
    }
}

export type IPollDetailProps = RouteComponentProps<{}> & IPollDetail.IInnerProps & IPollDetail.IStateFromProps & IPollDetail.IPropsFromDispatch;

export interface IPollDetailStates {
    waitingMessage: {
        show: boolean,
        message: JSX.Element | null,
    };
    errorMessage: {
        show: boolean,
        message: string | null,
    };
    votingMessage: {
        selectedIndex: number | null,
        selectedOption: string | null,
    };
    successfulMessage: {
        show: boolean,
        message: JSX.Element | null,
    };
    votesByIndex: number[] | null;
    chart: {
        option: ChartData<Chart.ChartData>;
    } | null;
    opened: boolean;
    inProgress: boolean;
}

export interface PollDetailArguments {
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
}
