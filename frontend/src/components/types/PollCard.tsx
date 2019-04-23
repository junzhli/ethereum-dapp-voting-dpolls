import { Address } from "../../types";

export interface IPollCardProps {
    web3: any;
    address: Address;
}

export interface IPollCardStates {
    isExpired: boolean | null;
}
