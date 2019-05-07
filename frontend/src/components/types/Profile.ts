import { BlockHeightType, AddressType } from "../../actions/types/eth";

export namespace IProfile {
    export interface IInnerProps {
        web3: any;
    }
    
    export interface IStateFromProps {
        accountAddress: AddressType | null;
    }
}

export type IProfileProps = IProfile.IInnerProps & IProfile.IStateFromProps;

export interface IProfileStates {
}
