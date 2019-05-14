import { Address } from "../../types";
import { BlockHeightType, AddressType } from "../../actions/types/eth";

export type IPollCardStatus = 'active' | 'inactive';

export namespace IPollCard {
    export interface IInnerProps {
        web3: any;
        address: Address;
        contract: any;
        isExpired: boolean;
        expiryBlockNumber: number;
        status: IPollCardStatus;
    }
    
    export interface IStateFromProps {
        accountAddress: AddressType | null;
        blockHeight: BlockHeightType;
    }
}

export type IPollCardProps = IPollCard.IInnerProps & IPollCard.IStateFromProps;

export interface IPollCardStates {
    externalData: {
        chairperson: string | null,
        isVoted: boolean | null,
        title: string,
        options: string[],
        votesAmount: number
    } | null;
}