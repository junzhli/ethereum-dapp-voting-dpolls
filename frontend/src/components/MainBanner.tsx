import React from 'react';
import { IMainBannerProps, IMainBannerStates } from './types/MainBanner';

class MainBanner extends React.Component<IMainBannerProps, IMainBannerStates> {
    private checkBlockNumberInterval: any;
    private checkAccountAddressInterval: any;
    
    constructor(props: IMainBannerProps) {
        super(props);
        this.checkBlockNumberInterval = null;
        this.checkAccountAddressInterval = null;
        this.state = {
            blockNumber: null,
            accountAddress: null,
            isLoaded: false
        }
    }

    async componentDidMount() {
        this.checkBlockNumberInterval = setInterval(async () => {
            const blockNumber = await this.props.web3.eth.getBlockNumber();
            if (blockNumber !== this.state.blockNumber) {
                this.setState({
                    blockNumber
                });
            }
        }, 1000);

        this.checkAccountAddressInterval = setInterval(async () => {
            const accountAddress = await this.props.web3.eth.getAccounts();
            if (accountAddress[0] !== this.state.accountAddress) {
                this.setState({
                    accountAddress
                });
            }
        }, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.checkAccountAddressInterval);
        clearInterval(this.checkBlockNumberInterval);
    }

    render() {
        return (
            <div id="banner">
                <div id="block-height">
                    Block height: { this.state.blockNumber }
                </div>
                <div id="account-address">
                    Account address: { this.state.accountAddress }
                </div>
            </div>
        )
    }
}

export default MainBanner;