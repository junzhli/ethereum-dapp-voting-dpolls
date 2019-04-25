import { Address } from "../../types";

export interface IInnerProps {
    web3: any;
}

export interface IStateFromProps {
}

export interface IPropsFromDispatch {
}

export type IMainListingPollProps = IInnerProps & IStateFromProps & IPropsFromDispatch;

export interface IMainListingPollState {
    amountPolls: number | null;
    polls: Address[] | null;
}
