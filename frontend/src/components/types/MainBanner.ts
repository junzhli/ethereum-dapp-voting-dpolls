import { AddressType, BlockHeightType } from "../../actions/types/eth";
import { Membership } from "../../types";

export namespace IMainBanner {
    export interface IInnerProps {
        web3: any;
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
    }
}

export type IMainBannerProps = IMainBanner.IInnerProps & IMainBanner.IStateFromProps & IMainBanner.IPropsFromDispatch;

export interface IMainBannerStates {
    isLoaded: boolean;
}
