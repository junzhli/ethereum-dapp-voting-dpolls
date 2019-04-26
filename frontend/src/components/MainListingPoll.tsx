import React from 'react';
import { IMainListingPollProps, IMainListingPollState } from './types/MainListingPoll';
import { VOTING_CORE_ABI } from '../constants/contractABIs';
import { Address } from '../types';
import PollCard from './PollCard';

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

    async componentDidMount() {
        const amountPolls = (await this.contract.methods.getAmountVotings().call()).toNumber();
        const polls: Address[] = [];
        for (let i = 0; i < amountPolls; i++) {
            const pollAddress = await this.contract.methods.getVotingItemByIndex(i).call();
            polls.push(pollAddress);
        }

        this.setState({
            amountPolls,
            polls
        });
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
                        Listing items ...
                    </div>
                )
            case 'completed':
                if (this.state.polls && this.state.polls.length === 0) {
                    return (
                        <div>
                            No polls for now
                        </div>
                    )
                }

                return (
                    this.state.polls && this.state.polls.map(pollAddress => {
                        return (
                            <PollCard web3={this.props.web3} address={pollAddress} key={pollAddress} />
                        )
                    })
                )
        }
    }

    render() {
        return this.renderComponent();
    }
}

export default MainListingPoll;