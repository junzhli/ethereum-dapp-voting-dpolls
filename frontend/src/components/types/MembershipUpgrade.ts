import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { Membership } from "../../types";
import { RouteComponentProps } from "react-router-dom";

export namespace IMembershipUpgrade {
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

export type IMembershipUpgradeProps = RouteComponentProps<{}> & IMembershipUpgrade.IInnerProps & IMembershipUpgrade.IStateFromProps & IMembershipUpgrade.IPropsFromDispatch;

export interface IMembershipUpgradeStates {
    waitingMessage: {
        show: boolean,
        message: JSX.Element | null,
    };
    errorMessage: {
        show: boolean,
        message: string | null,
    };
    successfulMessage: {
        show: boolean,
        message: JSX.Element | null,
    };
    opened: boolean;
}
