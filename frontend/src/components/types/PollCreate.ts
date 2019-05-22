import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { Membership } from "../../types";

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
        message: JSX.Element | null,
    };
    errorMessage: {
        show: boolean,
        message: string | string[] | null,
    };
    successfulMessage: {
        show: boolean,
        message: JSX.Element | null,
    };
    quota: string | null;
    optionsAmount: number;
    inputErrors: {
        blockHeight: boolean,
    };
    inputHints: {
        blockHeight: boolean,
    };
    opened: boolean;
}
