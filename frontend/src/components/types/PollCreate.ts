import { Address, Membership } from "../../types";
import { BlockHeightType, AddressType } from "../../actions/types/eth";

export namespace IPollCreate {
    export interface IInnerProps {
        web3: any;
    }
    
    export interface IStateFromProps {
        accountAddress: AddressType | null;
        blockHeight: BlockHeightType;
        membership: Membership | null;
    }

    export interface IPropsFromDispatch {
        setMembership: (nextMembership: Membership) => void;
    }
}

export type IPollCreateProps = IPollCreate.IInnerProps & IPollCreate.IStateFromProps & IPollCreate.IPropsFromDispatch;

export interface IPollCreateStates {
    waitingMessage: {
        show: boolean,
        message: string | null
    };
    errorMessage: {
        show: boolean,
        message: string | string[] | null
    };
    successfulMessage: {
        show: boolean
    };
    quota: string | null;
    optionsAmount: number;
    inputErrors: {
        blockHeight: boolean
    }
}
