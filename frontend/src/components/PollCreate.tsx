import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Button, Form, Icon, Label, Menu, Message, Modal, ModalProps } from "semantic-ui-react";
import { setMembership } from "../actions/eth";
import { ETHActionType, AddressType } from "../actions/types/eth";
import { VOTING_CORE_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import { Membership } from "../types";
import { sendTransaction } from "../utils/web3";
import MembershipUpgradePromotion from "./MembershipUpgradePromotion";
import style from "./PollCreate.module.css";
import { IPollCreate, IPollCreateProps, IPollCreateStates } from "./types/PollCreate";
import { getEtherscanTxURL } from "../utils/etherscan";
import { withRouter } from "react-router-dom";
import Routes from "../constants/routes";
import { addMonitoringPoll } from "../actions/poll";
import { PollActionType } from "../actions/types/poll";

const NETWORK_ID = process.env.REACT_APP_NETWORK_ID;
const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS as string;

class PollCreate extends React.Component<IPollCreateProps, IPollCreateStates> {
    private contract: any;
    private checkConfirmedIntervals: any[];
    private setTimeoutHolder: any;
    private initialState: IPollCreateStates;
    private formOnSubmitHandler: any;
    constructor(props: IPollCreateProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.checkConfirmedIntervals = [];
        this.setTimeoutHolder = null;
        this.initialState = {
            waitingMessage: {
                show: false,
                message: null,
            },
            errorMessage: {
                show: false,
                message: null,
            },
            successfulMessage: {
                show: false,
                message: null,
            },
            quota: null,
            optionsAmount: 2,
            inputErrors: {
                blockHeight: false,
            },
            inputHints: {
                blockHeight: false,
            },
            opened: (this.props.location.pathname === Routes.CREATE) ? true : false,
        };
        this.state = Object.assign({}, this.initialState);
        this.formOnSubmitHandler = this.createPoll.bind(this);
        this.blockHeightCheckHandler = this.blockHeightCheckHandler.bind(this);
        this.addOption = this.addOption.bind(this);
        this.blockHeightFocusOutHandler = this.blockHeightFocusOutHandler.bind(this);
        this.blockHeightFocusInHandler = this.blockHeightFocusInHandler.bind(this);
        this.onOpenHandler = this.onOpenHandler.bind(this);
        this.onCloseHandler = this.onCloseHandler.bind(this);
    }

    async componentDidMount() {
        if (this.props.accountAddress) {
            await this.refreshQuota(this.props.membership);
        }
    }

    async componentWillReceiveProps(nextProps: IPollCreateProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            if (nextProps.location.pathname === Routes.CREATE) {
                this.setState({
                    opened: true,
                });
            } else {
                this.setState({
                    opened: false,
                });
            }
        }

        if (nextProps.membership) {
            await this.refreshQuota(nextProps.membership);
        }
    }

    componentWillUnmount() {
        this.checkConfirmedIntervals.forEach((interval) => clearInterval(interval));

        if (this.setTimeoutHolder) {
            clearTimeout(this.setTimeoutHolder);
        }
    }

    onOpenHandler(event: React.MouseEvent<HTMLElement, MouseEvent>, data: ModalProps) {
        if (data.open === false) {
            this.setState({
                opened: true,
            });
            this.props.history.push(Routes.CREATE);
        }
    }

    onCloseHandler(event: React.MouseEvent<HTMLElement, MouseEvent>, data: ModalProps) {
        if (data.open === true) {
            this.setState({
                opened: false,
            });
            this.props.history.push(Routes.ROOT);
        }
    }

    blockHeightFocusOutHandler(event: React.FocusEvent<HTMLInputElement>) {
        this.setState({
            inputHints: {
                blockHeight: false,
            },
            inputErrors: {
                blockHeight: false,
            },
        });
    }

    blockHeightFocusInHandler(event: React.FocusEvent<HTMLInputElement>) {
        this.setState({
            inputHints: {
                blockHeight: true,
            },
            inputErrors: {
                blockHeight: false,
            },
        });
    }

    blockHeightCheckHandler(event: React.KeyboardEvent<HTMLInputElement>) {
        const charCode = event.charCode;
        if (charCode >= 48 && charCode <= 57) {
            if (this.state.inputErrors.blockHeight) {
                this.setState({
                    inputErrors: {
                        blockHeight: false,
                    },
                    inputHints: {
                        blockHeight: true,
                    },
                });
            }

            return true;
        }

        this.setState({
            inputErrors: {
                blockHeight: true,
            },
            inputHints: {
                blockHeight: false,
            },
        });
        event.preventDefault();
        return false;
    }

    async refreshQuota(membership: Membership | null) {
        switch (membership) {
            case Membership.CITIZEN:
                const quota = (await this.contract.methods.getQuota(this.props.accountAddress).call()).toNumber();
                return this.setState({
                    quota,
                });
            case Membership.DIAMOND:
                return this.setState({
                    quota: "Unlimited",
                });
            default:
                return this.setState({
                    quota: null,
                });
        }
    }

    addOption() {
        this.setState({
            optionsAmount: this.state.optionsAmount + 1,
        });
    }

    async createPoll(event: React.FormEvent) {
        this.setState({
            waitingMessage: {
                show: false,
                message: null,
            },
            errorMessage: {
                show: false,
                message: null,
            },
        });

        const errors: string[] = [];
        let title = (this.refs.title as any as HTMLInputElement).value;
        if (title === "") {
            errors.push("Title is empty");
        }
        title = this.props.web3.utils.padRight(this.props.web3.utils.utf8ToHex(title), 64);

        const block = (this.refs.block as any as HTMLInputElement).value;
        if (block === "") {
            errors.push("Expiry block height is empty");
        } else if (isNaN(Number(block))) {
            errors.push("Block number is invalid");
        } else if (Number(block) <= this.props.blockHeight + 1) {
            errors.push("Block number is behind the latest block");
        }

        const options = Array.from(Array(this.state.optionsAmount), (entity, index) => {
                const option = (this.refs["option" + index] as any as HTMLInputElement).value;
                if (option === "") {
                    errors.push("Option " + index + " is empty");
                    return null;
                }

                if (option.length > 20) {
                    errors.push("Option" + index + " exceeds 20 chars");
                    return null;
                }
                const hex = this.props.web3.utils.padRight(this.props.web3.utils.utf8ToHex(option), 64);

                return hex;
        });

        if (errors.length > 0) {
            return this.setState({
                errorMessage: {
                    show: true,
                    message: errors,
                },
                waitingMessage: {
                    show: false,
                    message: null,
                },
            });
        }

        this.setState({
            errorMessage: {
                show: false,
                message: null,
            },
            waitingMessage: {
                show: true,
                message: (
                    <div>
                        Waiting for user prompt...
                    </div>
                ),
            },
        });

        const web3 = this.props.web3;
        const from = this.props.accountAddress as string;
        const to = VOTING_CORE_ADDRESS;
        const data = this.contract.methods.createVoting(title, options, block).encodeABI();
        try {
            const txid = await sendTransaction(
                web3,
                from,
                to,
                data,
            );
            this.setState({
                errorMessage: {
                    show: false,
                    message: null,
                },
                waitingMessage: {
                    show: true,
                    message: (
                        <div>
                            Waiting for the transaction being confirmed. {
                                (getEtherscanTxURL(NETWORK_ID, txid)) && (
                                    <a target="_blank" rel="noopener noreferrer" href={getEtherscanTxURL(NETWORK_ID, txid) as string}>View on Etherscan</a>
                                )
                            }
                        </div>
                    ),
                },
            });

            const lastBlockNumber = this.props.blockHeight;
            const checkConfirmedInterval = setInterval(async () => {
                try {
                    const blockNumber = await this.props.web3.eth.getBlockNumber();
                    const receipt = await this.props.web3.eth.getTransactionReceipt(txid);
                    if (receipt && (lastBlockNumber !== blockNumber)) {
                        if (this.props.notificationStatus === true) {
                            const logAbi = [{
                                type: "address",
                                name: "_voting",
                            }];
                            const logData = receipt.logs[0].data;
                            const logTopics = receipt.logs[0].topics;

                            const decodedLog = this.props.web3.eth.abi.decodeLog(logAbi, logData, logTopics);
                            const newVotingAddress = decodedLog._voting;
                            this.props.addMonitoringPolls([newVotingAddress]);
                        }

                        this.setState({
                            waitingMessage: {
                                show: false,
                                message: null,
                            },
                            successfulMessage: {
                                show: true,
                                message: (
                                    <div>
                                        <p>Your transaction has been confirmed. {
                                            (getEtherscanTxURL(NETWORK_ID, txid)) && (
                                                <a target="_blank" rel="noopener noreferrer" href={getEtherscanTxURL(NETWORK_ID, txid) as string}>View on Etherscan</a>
                                            )
                                        }</p>
                                    </div>
                                ),
                            },
                        });
                        clearInterval(checkConfirmedInterval);
                        this.setTimeoutHolder = setTimeout(async () => {
                            const membership = (await this.contract.methods.getMembership(this.props.accountAddress).call()).toNumber();
                            this.props.setMembership(membership);
                            this.setState({
                                successfulMessage: {
                                    show: false,
                                    message: null,
                                },
                                opened: false,
                            });
                            await this.refreshQuota(this.props.membership);
                        }, 5000);
                    }
                } catch (error) {
                    // we skip any error
                    console.log("checkConfirmedInterval error occurred: " + error);
                }
            }, 1000);
            this.checkConfirmedIntervals.push(checkConfirmedInterval);
        } catch (error) {
            this.setState({
                waitingMessage: {
                    show: false,
                    message: null,
                },
                errorMessage: {
                    show: true,
                    message: [
                        error.message,
                    ],
                },
            });

            this.setTimeoutHolder = setTimeout(() => {
                this.setState({
                    errorMessage: {
                        show: false,
                        message: null,
                    },
                });
            }, 5000);
        }
    }

    renderComponent() {
        return (
            <div>
                {
                    this.state.waitingMessage.show && (
                        <Message icon={true}>
                            <Icon name="circle notched" loading={true} />
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
                            error={true}
                            header="There was some errors with your submission"
                            list={
                                this.state.errorMessage.message as string[]
                            }
                        />
                    )
                }
                {
                    this.state.successfulMessage.show && (
                        <Message positive={true}>
                            <Message.Header>Your creation has been performed successfully!</Message.Header>
                            {this.state.successfulMessage.message}
                        </Message>
                    )
                }
                <Form className={style["form-ui"]} size="large" onSubmit={this.formOnSubmitHandler}>
                    <Form.Field>
                        <label>Title</label>
                        <input placeholder="Enter a poll question" ref="title" />
                    </Form.Field>
                    <Form.Field>
                        <label>Host</label>
                        <input placeholder={(this.props.accountAddress) ? this.props.accountAddress : "Host"} disabled={true}/>
                    </Form.Field>
                    <Form.Field>
                        <label>Expiry Block Height</label>
                        <input onFocus={this.blockHeightFocusInHandler} onBlur={this.blockHeightFocusOutHandler} onKeyPress={this.blockHeightCheckHandler} placeholder="When will the poll expire?" ref="block" />
                        {
                            (this.state.inputHints.blockHeight) && (
                                <Label basic={true} color="teal" pointing={true}>
                                    Specify block number with more than {this.props.blockHeight + 1}
                                </Label>
                            )
                        }
                        {
                            (this.state.inputErrors.blockHeight) && (
                                <Label basic={true} color="red" pointing={true}>
                                    Invalid input
                                </Label>
                            )
                        }
                    </Form.Field>
                    <Form.Field>
                        <label>Options</label>
                        <div className={style["options-wrapper"]}>
                            <div className={style["option-outer"]}>
                                <input placeholder="Option 0" ref="option0" />
                                {
                                    Array.from(Array(this.state.optionsAmount), (entity, index) => {
                                        if (index !== 0) {
                                            return (
                                                <div key={index} className={style["option-divider"]}>
                                                    <input placeholder={"Option " + index} ref={"option" + index} />
                                                </div>
                                            );
                                        }
                                    })
                                }
                            </div>

                            <div className={style["button-outer"]}>
                                <Button circular={true} icon="plus" onClick={this.addOption} type="button" />
                            </div>
                        </div>

                    </Form.Field>
                    <div className={style["inline-container"]}>
                        <div className={style["inline-component"]}>
                            <Button type="submit">Submit</Button>
                        </div>
                        <div className={[style["inline-component"], style.quota].join(" ")}>
                            {
                                (this.state.quota && (
                                    "(Remaining quota: " + this.state.quota + ")"
                                ))
                            }

                        </div>
                    </div>
                </Form>
            </div>
        );
    }

    render() {
        return (
            <Modal
                trigger={
                    <Menu.Item
                        name="Create"
                        active={false}
                    />}
                closeIcon={true}
                closeOnDimmerClick={false}
                open={this.state.opened}
                onOpen={this.onOpenHandler}
                onClose={this.onCloseHandler}
                >
                <Modal.Header>Create a poll</Modal.Header>
                <Modal.Content>
                    {
                        (this.props.membership !== Membership.NO_BODY) ? this.renderComponent() : <MembershipUpgradePromotion />
                    }
                </Modal.Content>
            </Modal>
        );
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollCreate.IInnerProps): IPollCreate.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight,
        membership: state.ethMisc.membership,
        notificationStatus: state.userMisc.notificationStatus,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<ETHActionType | PollActionType>, ownProps: IPollCreate.IInnerProps): IPollCreate.IPropsFromDispatch => {
    return {
        setMembership: (nextMembership: Membership) => dispatch(setMembership(nextMembership)),
        addMonitoringPolls: (polls: AddressType[]) => dispatch(addMonitoringPoll(polls)),
    };
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(PollCreate));
