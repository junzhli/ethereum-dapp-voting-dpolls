export interface IMainBannerProps {
    web3: any;
}

export interface IMainBannerStates {
    blockNumber: string | null;
    accountAddress: string | null;
    isLoaded: boolean;
}
