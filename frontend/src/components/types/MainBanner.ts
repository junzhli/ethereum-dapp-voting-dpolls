import { BlockHeightType, AddressType } from "../../actions/types/eth";

export interface IInnerProps {
    web3: any;
}

export interface IStateFromProps {
    blockHeight: BlockHeightType,
    accountAddress: AddressType | null
}

export interface IPropsFromDispatch {
    setBlockHeight: (blockHeight: BlockHeightType) => void;
    setAccountAddress: (accountAddress: AddressType) => void;
}

export type IMainBannerProps = IInnerProps & IStateFromProps & IPropsFromDispatch;

export interface IMainBannerStates {
    isLoaded: boolean;
}
