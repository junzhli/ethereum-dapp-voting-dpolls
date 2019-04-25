import { BlockHeightType } from "../../actions/types/eth";

export interface IInnerProps {
    web3: any;
}

export interface IStateFromProps {
    blockHeight: BlockHeightType
}

export interface IPropsFromDispatch {
    setBlockHeight: (blockHeight: BlockHeightType) => void;
}

export type IMainBannerProps = IInnerProps & IStateFromProps & IPropsFromDispatch;

export interface IMainBannerStates {
    accountAddress: string | null;
    isLoaded: boolean;
}
