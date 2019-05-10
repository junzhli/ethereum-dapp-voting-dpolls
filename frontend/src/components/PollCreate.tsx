import React, { Dispatch } from 'react';
import { Modal, Button, Image, Header, Menu, Form, Checkbox, Icon, Message } from 'semantic-ui-react';
import { IPollCreate, IPollCreateProps, IPollCreateStates } from './types/PollCreate';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';
import style from './PollCreate.module.css';
import { VOTING_CORE_ABI } from '../constants/contractABIs';
import { sendTransaction } from '../utils/web3';
import { ETHActionType } from '../actions/types/eth';
import { Membership } from '../types';
import { setMembership } from '../actions/eth';
import MembershipUpgradePromotion from './MembershipUpgradePromotion';

const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS as string;
class PollCreate extends React.Component<IPollCreateProps, IPollCreateStates> {
    private contract: any;
    private checkConfirmedInterval: any;
    private setTimeoutHolder: any;
    private initialState: IPollCreateStates;
    constructor(props: IPollCreateProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.checkConfirmedInterval = null;
        this.setTimeoutHolder = null;
        this.initialState = {
            waitingMessage: {
                show: false,
                message: null
            },
            errorMessage: {
                show: false,
                message: null
            },
            successfulMessage: {
                show: false
            },
            optionsAmount: 2
        };
        this.state = Object.assign({}, this.initialState);
    }

    componentWillUnmount() {
        if (this.checkConfirmedInterval) {
            clearInterval(this.checkConfirmedInterval);
        }

        if (this.setTimeoutHolder) {
            clearTimeout(this.setTimeoutHolder);
        }
    }

    addOption() {
        this.setState({
            optionsAmount: this.state.optionsAmount + 1
        })
    }

    async createPoll(event: React.FormEvent) {
        this.setState({
            waitingMessage: {
                show: false,
                message: null
            },
            errorMessage: {
                show: false,
                message: null
            }
        })

        const errors: string[] = [];
        let title = (this.refs['title'] as any as HTMLInputElement).value;
        if (title === '') {
            errors.push('Title is empty');
        }
        title = this.props.web3.utils.padRight(this.props.web3.utils.utf8ToHex(title), 64);

        let block = (this.refs['block'] as any as HTMLInputElement).value;
        if (block === '') {
            errors.push('Expiry block height is empty');
        } else if (Number(block) <= this.props.blockHeight) {
            errors.push('Block number is behind the latest block');
        }
        
        const options = Array.from(Array(this.state.optionsAmount), (entity, index) => {
                const option = (this.refs['option' + index] as any as HTMLInputElement).value;
                if (option === '') {
                    errors.push('Option ' + index + ' is empty');
                    return null;
                }

                if (option.length > 20) {
                    errors.push('Option' + index + ' exceeds 20 chars');
                    return null;
                }
                const hex = this.props.web3.utils.padRight(this.props.web3.utils.utf8ToHex(option), 64);

                return hex;
        });

        if (errors.length > 0) {
            return this.setState({
                errorMessage: {
                    show: true,
                    message: errors
                },
                waitingMessage: {
                    show: false,
                    message: null
                }
            });
        }

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
        const to = VOTING_CORE_ADDRESS;
        const data = this.contract.methods.createVoting(title, options, block).encodeABI();
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
                        this.setTimeoutHolder = setTimeout(async () => {
                            const membership = (await this.contract.methods.getMembership(this.props.accountAddress).call()).toNumber();
                            this.props.setMembership(membership);
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
                    message: [
                        error.message
                    ]
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

    renderComponent() {
        return (
            <div>
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
                            list={
                                this.state.errorMessage.message as string[]
                            }
                        />
                    )
                }
                {
                    this.state.successfulMessage.show && (
                        <Message positive>
                            <Message.Header>Your creation has been performed successfully!</Message.Header>
                            <p>Your transaction has been confirmed.</p>
                        </Message>
                    )
                }
                <Form className={style['form-ui']} size='large' onSubmit={this.createPoll.bind(this)}>
                    <Form.Field>
                        <label>Title</label>
                        <input placeholder='Title' ref='title' />
                    </Form.Field>
                    <Form.Field>
                        <label>Host</label>
                        <input placeholder={(this.props.accountAddress) ? this.props.accountAddress : 'Host'} disabled/>
                    </Form.Field>
                    <Form.Field>
                        <label>Expiry Block Height</label>
                        <input placeholder='Block height' ref='block' />
                    </Form.Field>
                    <Form.Field>
                        <label>Options</label>
                        <div className={style['options-wrapper']}>
                            <div className={style['option-outer']}>
                                <input placeholder='Option 0' ref='option0' /> 
                                {
                                    Array.from(Array(this.state.optionsAmount), (entity, index) => {
                                        if (index !== 0) {
                                            return (
                                                <div className={style['option-divider']}>
                                                    <input placeholder={'Option ' + index} ref={'option' + index} />
                                                </div>
                                            )
                                        }
                                    })
                                }
                            </div>
                            
                            <div className={style['button-outer']}>
                                <Button circular icon='plus' onClick={() => this.addOption()} type='button' />
                            </div>
                        </div>
                        
                    </Form.Field>
                    {/* <Form.Field>
                        <Checkbox label='I agree to the Terms and Conditions' />
                    </Form.Field> */}
                    <Button type='submit'>Submit</Button>
                </Form>
                {/* <Image wrapped size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' />
                <Modal.Description>
                    <Header>Default Profile Image</Header>
                    <p>We've found the following gravatar image associated with your e-mail address.</p>
                    <p>Is it okay to use this photo?</p>
                </Modal.Description> */}
            </div>
        )
    }

    render() {
        return (
            <Modal trigger={
                <Menu.Item
                    name='Create'
                    active={false}
                />
            }>
                <Modal.Header>Create a poll</Modal.Header>
                <Modal.Content>
                    {
                        (this.props.membership !== Membership.NO_BODY) ? this.renderComponent() : <MembershipUpgradePromotion />
                    }
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollCreate.IInnerProps): IPollCreate.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight,
        membership: state.ethMisc.membership
    }
}

const mapDispatchToProps = (dispatch: Dispatch<ETHActionType>, ownProps: IPollCreate.IInnerProps): IPollCreate.IPropsFromDispatch => {
    return {
        setMembership: (nextMembership: Membership) => dispatch(setMembership(nextMembership))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PollCreate);
