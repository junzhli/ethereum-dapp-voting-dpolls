import { BlockHeightType, AddressType } from "../../actions/types/eth";

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

export type IPollDetailProps = IInnerProps & IStateFromProps;

export interface IPollDetailStates {
}
