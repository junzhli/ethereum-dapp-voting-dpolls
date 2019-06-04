import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { Membership } from "../../types";
import { RouteComponentProps } from "react-router-dom";

export namespace IMainBanner {
    export interface IInnerProps {
        web3: any;
        web3Rpc: any;
        userWalletUnlockApproval: any;
    }

    export interface IStateFromProps {
        blockHeight: BlockHeightType;
        accountAddress: AddressType | null;
        membership: Membership | null;
    }

    export interface IPropsFromDispatch {
        setBlockHeight: (blockHeight: BlockHeightType) => void;
        setAccountAddress: (accountAddress: AddressType) => void;
        setMembership: (nextMembership: Membership) => void;
        setNotificationStatus: (status: boolean) => void;
        setUserWindowsFocus: (focus: boolean) => void;
    }
}

export type IMainBannerProps = RouteComponentProps<{}> & IMainBanner.IInnerProps & IMainBanner.IStateFromProps & IMainBanner.IPropsFromDispatch;

export interface IMainBannerStates {
    isLoaded: boolean;
}
