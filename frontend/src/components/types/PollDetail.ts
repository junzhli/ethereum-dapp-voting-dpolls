import { ChartData } from "react-chartjs-2";
import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { RouteComponentProps } from "react-router-dom";

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
        votesAmount: number;
    }

    export interface IStateFromProps {
        accountAddress: AddressType | null;
        blockHeight: BlockHeightType;
    }
}

export type IPollDetailProps = RouteComponentProps<{}> & IPollDetail.IInnerProps & IPollDetail.IStateFromProps;

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
    votedOption: number | null;
    votesByIndex: number[] | null;
    chart: {
        option: ChartData<Chart.ChartData>;
    } | null;
    opened: boolean;
}
