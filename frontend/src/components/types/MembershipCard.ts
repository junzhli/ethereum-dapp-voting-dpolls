import { BlockHeightType, AddressType } from "../../actions/types/eth";

export namespace IMembershipUpgrade {
    export interface IInnerProps {
        web3: any;
    }
    
    export interface IStateFromProps {
        accountAddress: AddressType | null;
        blockHeight: BlockHeightType;
    }
}

export type IMembershipUpgradeProps = IMembershipUpgrade.IInnerProps & IMembershipUpgrade.IStateFromProps;

export interface IMembershipUpgradeStates {
}
