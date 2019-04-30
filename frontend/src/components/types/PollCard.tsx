import { Address } from "../../types";
import { BlockHeightType, AddressType } from "../../actions/types/eth";

export namespace IPollCard {
    export interface IInnerProps {
        web3: any;
        address: Address;
    }
    
    export interface IStateFromProps {
        accountAddress: AddressType | null;
        blockHeight: BlockHeightType;
    }
}

export type IPollCardProps = IPollCard.IInnerProps & IPollCard.IStateFromProps;

export interface IPollCardStates {
    externalData: {
        isExpired: boolean | null,
        isVoted: boolean | null,
        expiryBlockNumber: number,
        title: string,
        options: string[],
        votesAmount: number
    } | null;
}
