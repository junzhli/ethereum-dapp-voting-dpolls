import React, { SyntheticEvent } from 'react';
import { Modal, Button, Header, Image, Message, Icon, Form, Checkbox } from 'semantic-ui-react';
import { IPollDetailProps, IPollDetailStates, IPollDetail } from './types/PollDetail';
import { sendTransaction } from '../utils/web3';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';
import { VOTING_ABI } from '../constants/contractABIs';
import style from './PollDetail.module.css';
import commonStyle from '../commons/styles/index.module.css';

class PollDetail extends React.Component<IPollDetailProps, IPollDetailStates> {
    private checkConfirmedInterval: any;
    private setTimeoutHolder: any;
    private contract: any;

    constructor(props: IPollDetailProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_ABI, this.props.address);
        this.checkConfirmedInterval = null;
        this.setTimeoutHolder = null;
        this.state = {
            waitingMessage: {
                show: false,
                message: null
            },
            errorMessage: {
                show: false,
                message: null
            },
            votingMessage: {
                selectedIndex: null,
                selectedOption: null
            },
            successfulMessage: {
                show: false
            },
            votedOption: null
        }
    }

    async componentWillMount() {
        if (this.props.isVoted) {
            const selectedIndex = (await this.contract.methods.getMyOption(this.props.accountAddress).call()).toNumber();
            this.setState({
                votingMessage: {
                    selectedIndex,
                    selectedOption: this.props.options[selectedIndex]
                }
            })
        }
    }

    componentWillUnmount() {
        if (this.checkConfirmedInterval) {
            clearInterval(this.checkConfirmedInterval);
        }

        if (this.setTimeoutHolder) {
            clearTimeout(this.setTimeoutHolder);
        }
    }

    async vote(option: number) {
        this.setState({
            errorMessage: {
                show: false,
                message: null
            },
            waitingMessage: {
                show: true,
                message: 'Waiting for user prompt...'
            }
        })

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
                            },
                            successfulMessage: {
                                show: true
                            }
                        });
                        clearInterval(this.checkConfirmedInterval);
                        this.setTimeoutHolder = setTimeout(() => {
                            this.setState({
                                successfulMessage: {
                                    show: false
                                }
                            })
                        }, 5000);
                    }
                } catch (error) {
                    // we skip any error
                    console.log('error occurred: ' + error);
                }
                
            }, 1000);
        } catch (error) {
            this.setState({
                waitingMessage: {
                    show: false,
                    message: null
                },
                errorMessage: {
                    show: true,
                    message: error.message
                }
            })

            this.setTimeoutHolder = setTimeout(() => {
                this.setState({
                    errorMessage: {
                        show: false,
                        message: null
                    }
                })
            }, 5000);
        }
    }

    handleOptionVoted(event: SyntheticEvent, object: any) {
        this.setState({
            votingMessage: {
                selectedIndex: object.value,
                selectedOption: object.name
            }
        })
    }

    render() {
        return (
            <div className={style['align-right']}>
                <Modal dimmer={true} trigger={
                <Button animated>
                    <Button.Content visible>Detail</Button.Content>
                    <Button.Content hidden>
                        <Icon name='arrow right' />
                    </Button.Content>
                </Button>}>
                    <Modal.Header>Poll detail</Modal.Header>
                    <Modal.Content image>
                        {/* <Image
                            wrapped
                            size="medium"
                            src="https://react.semantic-ui.com/images/avatar/large/rachel.png"
                        /> */}
                        <Modal.Description>
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
                            {
                                this.state.successfulMessage.show && (
                                    <Message positive>
                                        <Message.Header>You vote successfully!</Message.Header>
                                        <p>Your transaction has been confirmed.</p>
                                    </Message>
                                )
                            }
                            <Header>{this.props.title}</Header>
                            <div>
                                Expiry Block Height: {this.props.expiryBlockHeight}
                            </div>
                            <Form>
                                {
                                    this.props.options.map((option, index) => {
                                        return (
                                            <Form.Field>
                                                <Checkbox
                                                    radio
                                                    label={option}
                                                    name={option}
                                                    value={index}
                                                    checked={this.state.votingMessage.selectedIndex === index}
                                                    onChange={this.handleOptionVoted.bind(this)}
                                                    disabled={this.props.isVoted}
                                                />
                                            </Form.Field>
                                        )
                                    })
                                }
                                {
                                    this.state.votingMessage.selectedOption && (
                                        <Form.Field>
                                            { this.props.isVoted ? ('You haved voted for') : ('You are voting for')} <b>{ this.state.votingMessage.selectedOption }</b>
                                        </Form.Field>
                                    )
                                }
                            </Form>
                            {
                                (this.state.votingMessage.selectedIndex !== null && !this.props.isVoted) && (
                                    <Button content='Vote!' onClick={() => this.vote(this.state.votingMessage.selectedIndex as number)}/>
                                )
                            }
                            
                            {/* {
                                this.props.options.map((option, index) => {
                                    return (
                                        <div key={option}>
                                            <div>
                                                {index}: {option}
                                            </div>
                                            {
                                                !this.props.isVoted && (
                                                    <div>
                                                        <Button onClick={() => this.vote(index)}>Vote</Button>
                                                    </div>
                                                )
                                            }
                                            
                                        </div>
                                    )
                                })
                            } */}
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
