import React from 'react';
import { Modal, Button, Header, Image, Message, Icon } from 'semantic-ui-react';
import { IPollDetailProps, IPollDetailStates, IPollDetail } from './types/PollDetail';
import { sendTransaction } from '../utils/web3';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';

class PollDetail extends React.Component<IPollDetailProps, IPollDetailStates> {
    private checkConfirmedInterval: any;

    constructor(props: IPollDetailProps) {
        super(props);
        this.checkConfirmedInterval = null;
        this.state = {
            waitingMessage: {
                show: false,
                message: null
            },
            errorMessage: {
                show: false,
                message: null
            }
        }
    }

    componentWillUnmount() {
        if (this.checkConfirmedInterval) {
            clearInterval(this.checkConfirmedInterval);
        }
    }

    async vote(option: number) {
        const web3 = this.props.web3;
        const from = this.props.accountAddress as string;
        const to = this.props.address;
        const data = this.props.contract.methods.vote(option).encodeABI();
        try {
            const txid = await sendTransaction(
                web3,
                from,
                to,
                data
            )
            this.setState({
                errorMessage: {
                    show: false,
                    message: null
                },
                waitingMessage: {
                    show: true,
                    message: 'Waiting for a few blocks being confirmed'
                }
            })
            this.checkConfirmedInterval = setInterval(async () => {
                try {
                    const receipt = await this.props.web3.eth.getTransactionReceipt(txid);
                    if (receipt) {
                        this.setState({
                            waitingMessage: {
                                show: false,
                                message: null
                            }
                        });
                        clearInterval(this.checkConfirmedInterval);
                    }
                } catch (error) {
                    // we skip any error
                    console.log('error occurred: ' + error);
                }
                
            }, 1000);
        } catch (error) {
            this.setState({
                errorMessage: {
                    show: true,
                    message: error.message
                }
            })
        }
    }

    render() {
        return (
            <div>
                <Modal dimmer={true} trigger={
                <Button animated>
                    <Button.Content visible>Detail</Button.Content>
                    <Button.Content hidden>
                        <Icon name='arrow right' />
                    </Button.Content>
                </Button>}>
                    {
                        this.state.waitingMessage.show && (
                            <Message icon>
                                <Icon name='circle notched' loading />
                                <Message.Content>
                                <Message.Header>Just a few seconds</Message.Header>
                                {this.state.waitingMessage.message}
                                </Message.Content>
                            </Message>
                        )
                    }
                    {
                        this.state.errorMessage.show && (
                            <Message
                                error
                                header='There was some errors with your submission'
                                list={[
                                this.state.errorMessage.message,
                                ]}
                            />
                        )
                    }
                    <Modal.Header>Poll detail</Modal.Header>
                    <Modal.Content image>
                        {/* <Image
                            wrapped
                            size="medium"
                            src="https://react.semantic-ui.com/images/avatar/large/rachel.png"
                        /> */}
                        <Modal.Description>
                            <Header>{this.props.title}</Header>
                            <div>
                                Expiry Block Height: {this.props.expiryBlockHeight}
                            </div>
                            {
                                this.props.options.map((option, index) => {
                                    return (
                                        <div key={option}>
                                            <div>
                                                {index}: {option}
                                            </div>
                                            {
                                                !this.props.isVoted && (
                                                    <div>
                                                        <button onClick={() => this.vote(index)}>Vote</button>
                                                    </div>
                                                )
                                            }
                                            
                                        </div>
                                    )
                                })
                            }
                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollDetail.IInnerProps): IPollDetail.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress
    }
}

export default connect(
    mapStateToProps,
    null
)(PollDetail);

