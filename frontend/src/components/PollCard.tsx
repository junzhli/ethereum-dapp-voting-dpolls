import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { IPollCardProps, IPollCardStates, IStateFromProps, IInnerProps } from './types/PollCard';
import { VOTING_ABI } from '../constants/contractABIs';
import { StoreState } from '../store/types';
import PollDetail from './PollDetail';

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

    async checkIfVoted() {
        if (this.props.accountAddress === null) {
            return null;
        }

        const isExpired = await this.contract.methods.isVoted(this.props.accountAddress).call();
        return isExpired;
    }

    async componentWillReceiveProps(nextProps: IPollCardProps) {
        if (this.props !== nextProps) {
            const isExpired = this.checkIfExpired();
            const isVoted = await this.checkIfVoted();
            
            if (this.state.externalData) {
                if (isExpired !== this.state.externalData.isExpired || isVoted !== this.state.externalData.isVoted) {
                    console.log('set')
                    this.setState({
                        externalData: Object.assign(this.state.externalData, {
                            isExpired,
                            isVoted
                        })
                    })
                }
            }
            
        }
    }

    async componentDidMount() {
        const expiryBlockNumber = Number(await this.contract.methods.expiryBlockNumber().call());
        const isExpired = this.checkIfExpired();
        const title = this.props.web3.utils.hexToUtf8(await this.contract.methods.title().call()) as string;
        const isVoted = await this.checkIfVoted();
        const amountOptions = Number(await this.contract.methods.optionsAmount().call());
        const options = [];
        for (let i = 0; i < amountOptions; i++) {
            options.push(this.props.web3.utils.hexToUtf8(await this.contract.methods.getOptionTitleByIndex(i).call()) as string);
        }

        this.setState({
            externalData: {
                expiryBlockNumber,
                isExpired,
                isVoted,
                options,
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
            if (this.state.externalData.isExpired !== null && this.state.externalData.isVoted !== null) {
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
                        <br></br>
                        Expired at: { this.state.externalData && this.state.externalData.expiryBlockNumber }
                        <div>
                            Still loading...
                        </div>
                    </div>
                )
            case 'completed':
                console.log('completed');
                return (
                    <div>
                        Title: { this.state.externalData && this.state.externalData.title }
                        <br></br>
                        Expired at: { this.state.externalData && this.state.externalData.expiryBlockNumber }
                        <div>
                            {/* <button disabled={(this.state.externalData && this.state.externalData.isExpired !== null) ? this.state.externalData.isExpired ? true : this.state.externalData.isVoted ? true : false : true}>
                                Vote!
                            </button> */}
                            <PollDetail web3={this.props.web3} address={this.props.address} title={(this.state.externalData && this.state.externalData.title) as string} options={(this.state.externalData && this.state.externalData.options) as string[]} expiryBlockHeight={(this.state.externalData && this.state.externalData.expiryBlockNumber) as number} isExpired={(this.state.externalData && this.state.externalData.isExpired) as boolean} isVoted={(this.state.externalData && this.state.externalData.isVoted) as boolean} contract={this.contract} />
                        </div>
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
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight
    }
}

export default connect(
    mapStateToProps,
    null
)(PollCard);