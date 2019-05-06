import React, { Dispatch } from 'react';
import { connect } from 'react-redux';
import { IPollCardProps, IPollCardStates, IPollCard } from './types/PollCard';
import { VOTING_ABI } from '../constants/contractABIs';
import { StoreState } from '../store/types';
import PollDetail from './PollDetail';
import { Item, Placeholder, Icon, Segment, Header, Button } from 'semantic-ui-react';
import commonStyle from '../commons/styles/index.module.css';
import style from './PollCard.module.css';

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
            const isVoted = await this.checkIfVoted();
            if (this.state.externalData) {
                if (isVoted !== this.state.externalData.isVoted) {
                    this.setState({
                        externalData: Object.assign(this.state.externalData, {
                            isVoted
                        })
                    })
                }
            }
            
        }
    }

    async componentDidUpdate(prevProps: IPollCardProps) {
        const isExpired = this.checkIfExpired();
        const isVoted = await this.checkIfVoted();
        const votesAmount = (await this.contract.methods.votesAmount().call()).toNumber();
        if (this.state.externalData) {
            if (isExpired !== this.state.externalData.isExpired || votesAmount !== this.state.externalData.votesAmount) {
                this.setState({
                    externalData: Object.assign(this.state.externalData, {
                        isExpired,
                        isVoted,
                        votesAmount
                    })
                })
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
        const votesAmount = (await this.contract.methods.votesAmount().call()).toNumber();

        this.setState({
            externalData: {
                expiryBlockNumber,
                isExpired,
                isVoted,
                options,
                title,
                votesAmount
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
            case 'non-loaded-completely':
                return (
                    <Segment color='teal'>
                        <Placeholder style={{ height: 56, width: 56 }}>
                            <Placeholder.Image />
                        </Placeholder>
                        <Placeholder>
                            <Placeholder.Paragraph>
                                <Placeholder.Line />
                            </Placeholder.Paragraph>
                            <Placeholder.Paragraph>
                                <Placeholder.Line />
                                <Placeholder.Line />
                                <Placeholder.Line />
                            </Placeholder.Paragraph>
                        </Placeholder>
                    </Segment>
                )
            case 'completed':
                return (
                    // <Item>
                        <Segment color='teal'>
                            {/* <Item.Image size='medium' src='/images/wireframe/image.png' /> */}
                            <div className={style['top-bottom-border']}>
                                <Icon size='huge' name='hand paper outline' />
                            </div>
                            
                            <Item.Content className={style['top-bottom-border']}>
                                <Header as='h2'>
                                    { this.state.externalData && this.state.externalData.title }
                                </Header>
                                
                                {/* <Item.Header>
                                    
                                </Item.Header> */}
                                <Item.Extra>
                                    <Icon color='red' name='user outline' /> { this.props.address }
                                </Item.Extra>
                                <Item.Extra>
                                    { (this.state.externalData && this.state.externalData.isExpired) ? <Icon color='red' name='close' /> : <Icon color='green' name='check' /> } Expired at { this.state.externalData && this.state.externalData.expiryBlockNumber }
                                </Item.Extra>
                                <Item.Extra>
                                    <Icon color='brown' name='users' /> { this.state.externalData && this.state.externalData.votesAmount } votes
                                </Item.Extra>
                            </Item.Content>
                            <PollDetail 
                            web3={this.props.web3} 
                            address={this.props.address} 
                            title={(this.state.externalData && this.state.externalData.title) as string} 
                            options={(this.state.externalData && this.state.externalData.options) as string[]} 
                            votesAmount={(this.state.externalData && this.state.externalData.votesAmount) as number}
                            expiryBlockHeight={(this.state.externalData && this.state.externalData.expiryBlockNumber) as number} 
                            isExpired={(this.state.externalData && this.state.externalData.isExpired) as boolean} 
                            isVoted={(this.state.externalData && this.state.externalData.isVoted) as boolean} 
                            contract={this.contract} />
                        </Segment>
                    // </Item>
                )
        }
    }

    render() {
        return this.renderComponent();
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollCard.IInnerProps): IPollCard.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight
    }
}

export default connect(
    mapStateToProps,
    null
)(PollCard);