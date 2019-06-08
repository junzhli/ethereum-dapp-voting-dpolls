import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { Address } from "../../types";
import { PollDetailArguments } from "./PollDetail";
import { RouteComponentProps } from "react-router-dom";

export type IPollCardStatus = "active" | "inactive";

export namespace IPollCard {
    export interface IInnerProps {
        web3: any;
        web3Rpc: any;
        address: Address;
        contract: any;
        isExpired: boolean;
        expiryBlockNumber: number;
        status: IPollCardStatus;
        additionalDataConnecter?: (address: AddressType, title: string, chairperson: AddressType) => void;
        display: boolean;
        detailViewOnly?: boolean;
        detailViewDataConnecter?: (args: PollDetailArguments | null) => void;
    }

    export interface IStateFromProps {
        accountAddress: AddressType | null;
        blockHeight: BlockHeightType;
        activeDetailViewInProgress: boolean;
        activeDetailViewAddress: AddressType | null;
    }
}

export type IPollCardProps = RouteComponentProps<{}> & IPollCard.IInnerProps & IPollCard.IStateFromProps;

export interface IPollCardStates {
    externalData: {
        chairperson: string | null,
        isVoted: boolean | null,
        title: string,
        options: string[],
        votesAmount: number,
    } | null;
    detailViewLoading: boolean;
}
