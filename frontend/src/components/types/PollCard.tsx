import { Address } from "../../types";
import { BlockHeightType } from "../../actions/types/eth";

export interface IInnerProps {
    web3: any;
    address: Address;
}

export interface IStateFromProps {
    blockHeight: BlockHeightType
}

export type IPollCardProps = IInnerProps & IStateFromProps;

export interface IPollCardStates {
    externalData: {
        isExpired: boolean | null,
        expiryBlockNumber: number,
        title: string
    } | null;
}
