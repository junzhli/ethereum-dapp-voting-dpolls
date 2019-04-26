import React, { Dispatch } from 'react';
import { IMainBannerProps, IMainBannerStates, IStateFromProps, IPropsFromDispatch, IInnerProps } from './types/MainBanner';
import { StoreState } from '../store/types';
import { ETHActionType, BlockHeightType, AddressType } from '../actions/types/eth';
import { setBlockHeight, setAccountAddress } from '../actions/eth';
import { connect } from 'react-redux';

class MainBanner extends React.Component<IMainBannerProps, IMainBannerStates> {
    private checkBlockNumberInterval: any;
    private checkAccountAddressInterval: any;
    
    constructor(props: IMainBannerProps) {
        super(props);
        this.checkBlockNumberInterval = null;
        this.checkAccountAddressInterval = null;
        this.state = {
            isLoaded: false
        }
    }

    async componentDidMount() {
        this.checkBlockNumberInterval = setInterval(async () => {
            const blockNumber = await this.props.web3.eth.getBlockNumber();
            if (blockNumber !== this.props.blockHeight) {
                this.props.setBlockHeight(blockNumber);
            }
        }, 1000);

        this.checkAccountAddressInterval = setInterval(async () => {
            const accountAddress = await this.props.web3.eth.getAccounts();
            if (accountAddress[0] !== this.props.accountAddress) {
                this.props.setAccountAddress(accountAddress[0]);
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
                    Block height: { this.props.blockHeight }
                </div>
                <div id="account-address">
                    Account address: { this.props.accountAddress }
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IInnerProps): IStateFromProps => {
    return {
        blockHeight: state.ethMisc.blockHeight,
        accountAddress: state.ethMisc.accountAddress
    }
}

const mapDispatchToProps = (dispatch: Dispatch<ETHActionType>, ownProps: IInnerProps): IPropsFromDispatch => {
    return {
        setBlockHeight: (blockHeight: BlockHeightType) => dispatch(setBlockHeight(blockHeight)),
        setAccountAddress: (accountAddress: AddressType) => dispatch(setAccountAddress(accountAddress))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainBanner);
