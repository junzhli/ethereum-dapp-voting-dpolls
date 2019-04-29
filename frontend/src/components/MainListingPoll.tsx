import React from 'react';
import { IMainListingPollProps, IMainListingPollState, IMainListingPoll } from './types/MainListingPoll';
import { VOTING_CORE_ABI } from '../constants/contractABIs';
import { Address } from '../types';
import PollCard from './PollCard';
import { Item, Icon, Loader } from 'semantic-ui-react';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';

const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS;

class MainListingPoll extends React.Component<IMainListingPollProps, IMainListingPollState> {
    private contract: any;
    constructor(props: IMainListingPollProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.state = {
            amountPolls: null,
            polls: null
        }
    }

    async fetchPolls() {
        const amountPolls: number = (await this.contract.methods.getAmountVotings().call()).toNumber();
        const polls: Address[] = [];
        for (let i = 0; i < amountPolls; i++) {
            const pollAddress = await this.contract.methods.getVotingItemByIndex(i).call();
            polls.push(pollAddress);
        }

        return {
            amountPolls,
            polls
        };
    }

    async componentDidMount() {
        const { amountPolls, polls } = await this.fetchPolls();

        this.setState({
            amountPolls,
            polls
        });
    }
    
    async componentWillUpdate(nextProps: IMainListingPollProps) {
        if (this.props !== nextProps) {
            const { amountPolls, polls } = await this.fetchPolls();

            this.setState({
                amountPolls,
                polls
            });
        }
    }

    renderComponent() {
        let state: 'loading' | 'completed' | null = null;

        if (this.state.amountPolls === null) {
            state = 'loading';
        } else {
            state = 'completed';
        }

        switch (state) {
            case 'loading':
                return (
                    <div>
                        <Loader active inline='centered' />
                    </div>
                )
            case 'completed':
                if (this.state.polls && this.state.polls.length === 0) {
                    return (
                        <Item.Group>
                            No poll for now...
                        </Item.Group>
                    )
                }

                return (
                    <Item.Group divided>
                        {
                            this.state.polls && this.state.polls.map(pollAddress => {
                                return (
                                    <PollCard web3={this.props.web3} address={pollAddress} key={pollAddress} />
                                )
                            })
                        }
                    </Item.Group>
                    
                )
        }
    }

    render() {
        return this.renderComponent();
    }
}

const mapStateToProps = (state: StoreState, ownProps: IMainListingPoll.IInnerProps): IMainListingPoll.IStateFromProps => {
    return {
        blockHeight: state.ethMisc.blockHeight
    }
}

export default connect(
    mapStateToProps,
    null
)(MainListingPoll);
