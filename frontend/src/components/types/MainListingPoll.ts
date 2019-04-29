import { Address } from "../../types";
import { BlockHeightType } from "../../actions/types/eth";


export namespace IMainListingPoll {
    export interface IInnerProps {
        web3: any;
    }
    
    export interface IStateFromProps {
        blockHeight: BlockHeightType
    }
    
    export interface IPropsFromDispatch {
    }
}

export type IMainListingPollProps = IMainListingPoll.IInnerProps & IMainListingPoll.IStateFromProps & IMainListingPoll.IPropsFromDispatch;

export interface IMainListingPollState {
    amountPolls: number | null;
    polls: Address[] | null;
}
