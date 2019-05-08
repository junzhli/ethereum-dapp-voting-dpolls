import { BlockHeightType, AddressType } from "../../actions/types/eth";
import { Membership } from "../../types";

export namespace IProfile {
    export interface IInnerProps {
        web3: any;
    }
    
    export interface IStateFromProps {
        blockHeight: BlockHeightType,
        accountAddress: AddressType | null,
        membership: Membership | null,
    }
}

export type IProfileProps = IProfile.IInnerProps & IProfile.IStateFromProps;

export interface IProfileStates {
}
