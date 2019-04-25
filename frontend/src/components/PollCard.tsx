import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { IPollCardProps, IPollCardStates, IStateFromProps, IInnerProps } from './types/PollCard';
import { VOTING_ABI } from '../constants/contractABIs';
import { StoreState } from '../store/types';
import { ETHActionType, BlockHeightType } from '../actions/types/eth';
import { setBlockHeight } from '../actions/eth';

class PollCard extends React.Component<IPollCardProps, IPollCardStates> {
    private contract: any;
    constructor(props: IPollCardProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_ABI, this.props.address);
        this.state = {
            externalData: null
        }
    }

    checkIfExpired() {
        if (this.props.blockHeight === null || this.state.externalData === null) {
            return null;
        }

        const isExpired = (this.props.blockHeight > this.state.externalData.expiryBlockNumber) ? true : false;
        return isExpired;
    }

    componentWillReceiveProps(nextProps: IPollCardProps) {
        if (this.props !== nextProps) {
            const isExpired = this.checkIfExpired();
            if (isExpired !== (this.state.externalData && this.state.externalData.isExpired)) {
                this.setState({
                    externalData: Object.assign(this.state.externalData, {
                        isExpired
                    })
                })
            }
        }
    }

    async componentDidMount() {
        const expiryBlockNumber = Number(await this.contract.methods.expiryBlockNumber().call());
        const isExpired = this.checkIfExpired();
        const title = (await this.contract.methods.title().call()) as string;
        this.setState({
            externalData: {
                expiryBlockNumber,
                isExpired,
                title
            }
        })
    }

    renderComponent() {
        let state: 'loading' | 'non-loaded-completely' | 'completed' | null = null;

        if (this.state.externalData === null) {
            state = 'loading';
        }

        if (this.state.externalData && this.state.externalData.expiryBlockNumber) {
            if (this.state.externalData.isExpired) {
                state = 'completed';
            } else {
                state = 'non-loaded-completely';
            }
        }

        switch (state) {
            case 'loading':
                return (
                    <div>
                        Loading ...
                    </div>
                )
            case 'non-loaded-completely':
                return (
                    <div>
                        Title: { this.state.externalData && this.state.externalData.title }
                        Expired at: { this.state.externalData && this.state.externalData.expiryBlockNumber }
                    </div>
                )
            case 'completed':
                return (
                    <div>
                        Title: { this.state.externalData && this.state.externalData.title }
                        Expired at: { this.state.externalData && this.state.externalData.expiryBlockNumber }
                        Expired!
                    </div>
                )
        }
    }

    render() {
        return this.renderComponent();
    }
}

const mapStateToProps = (state: StoreState, ownProps: IInnerProps): IStateFromProps => {
    return {
        blockHeight: state.ethMisc.blockHeight
    }
}

export default connect(
    mapStateToProps,
    null
)(PollCard);