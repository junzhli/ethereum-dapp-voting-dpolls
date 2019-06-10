import React, { Dispatch, SyntheticEvent } from "react";
import { connect } from "react-redux";
import { Button, Grid, Icon, Label, Message, Modal, Segment, ModalProps, Header } from "semantic-ui-react";
import { setMembership } from "../actions/eth";
import { ETHActionType } from "../actions/types/eth";
import { VOTING_CORE_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import { Membership } from "../types";
import { sendTransaction } from "../utils/web3";
import style from "./MembershipUpgrade.module.css";
import { IMembershipUpgrade, IMembershipUpgradeProps, IMembershipUpgradeStates } from "./types/MembershipUpgrade";
import { getEtherscanTxURL } from "../utils/etherscan";
import { withRouter } from "react-router-dom";
import Routes from "../constants/routes";
import { NOTIFICATION_TITLE, ERROR_METAMASK_NOT_INSTALLED } from "../constants/project";
import { toast } from "react-toastify";
import Toast from "./Toast";

const NETWORK_ID = process.env.REACT_APP_NETWORK_ID;
const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS;
class MembershipUpgrade extends React.Component<IMembershipUpgradeProps, IMembershipUpgradeStates> {
    private contract: any;
    private checkConfirmedInterval: any;
    private setTimeoutHolder: any;
    private upgradeButtonOnClick: any;
    constructor(props: IMembershipUpgradeProps) {
        super(props);
        this.contract = new this.props.web3Rpc.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.state = {
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
            opened: (this.props.location.pathname === Routes.UPGRADE) ? true : false,
            inProgress: false,
        };
        this.upgradeButtonOnClick = this.upgradeHandler.bind(this);
        this.onOpenHandler = this.onOpenHandler.bind(this);
        this.onCloseHandler = this.onCloseHandler.bind(this);
    }

    async componentWillReceiveProps(nextProps: IMembershipUpgradeProps) {
        if (nextProps.location.pathname !== this.props.location.pathname) {
            if (nextProps.location.pathname === Routes.UPGRADE) {
                this.setState({
                    opened: true,
                });
            } else {
                this.setState({
                    opened: false,
                });
            }
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

    onOpenHandler(event: React.MouseEvent<HTMLElement, MouseEvent>, data: ModalProps) {
        if (data.open === false) {
            this.setState({
                opened: true,
            });
            this.props.history.push(Routes.UPGRADE);
        }
    }

    onCloseHandler(event: React.MouseEvent<HTMLElement, MouseEvent>, data: ModalProps) {
        if (data.open === true) {
            this.setState({
                opened: false,
            });
            this.props.history.push(Routes.ROOT);

            if (this.state.inProgress) {
                const title = "Membership Upgrade";
                const detail = "Membership upgrade is still in progress...";
                toast(<Toast title={title} detail={detail} />);
            }
        }
    }

    async upgradeHandler(event: SyntheticEvent, data: any) {
        switch (data.value) {
            case Membership.CITIZEN:
                await this.upgradeMembership(Membership.CITIZEN, 10 ** 18);
                break;
            case Membership.DIAMOND:
                await this.upgradeMembership(Membership.DIAMOND, 10 * (10 ** 18));
                break;
            default:
                return null;
        }
    }

    async upgradeMembership(membership: Membership , value: number) {
        this.setState({
            errorMessage: {
                show: false,
                message: null,
            },
            waitingMessage: {
                show: false,
                message: null,
            },
            successfulMessage: {
                show: false,
                message: null,
            },
            inProgress: true,
        });

        const web3 = this.props.web3;
        const from = this.props.accountAddress as string;
        const to = VOTING_CORE_ADDRESS as string;
        const data = this.contract.methods.applyAsHost().encodeABI();
        try {
            const txid = await sendTransaction(
                web3,
                from,
                to,
                data,
                value,
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

            if (this.checkConfirmedInterval) {
                clearInterval(this.checkConfirmedInterval);
            }
            this.checkConfirmedInterval = setInterval(async () => {
                try {
                    const receipt = await this.props.web3Rpc.eth.getTransactionReceipt(txid);
                    if (receipt && (receipt.blockNumber <= this.props.blockHeight)) {
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

                        this.props.setMembership(membership);

                        const notificationText = "You are upgraded to paid membership!";
                        if (!this.props.userWindowFocus && this.props.notificationStatus === true) {
                            const notification = new Notification(NOTIFICATION_TITLE, {
                                body: notificationText,
                            });
                        }

                        const title = "Membership Upgrade";
                        const detail = notificationText;
                        toast(<Toast title={title} detail={detail} />, {
                            autoClose: false,
                        });

                        clearInterval(this.checkConfirmedInterval);
                        this.setTimeoutHolder = setTimeout(() => {
                            this.setState({
                                successfulMessage: {
                                    show: false,
                                    message: null,
                                },
                            });
                        }, 5000);
                    }
                } catch (error) {
                    // we skip any error
                    console.log("checkConfirmedInterval error occurred: " + error);
                }

            }, 1000);
        } catch (error) {
            this.setState({
                waitingMessage: {
                    show: false,
                    message: null,
                },
                errorMessage: {
                    show: true,
                    message: error.message,
                },
                inProgress: false,
            });

            if (this.setTimeoutHolder) {
                clearTimeout(this.setTimeoutHolder);
            }
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

    render() {
        return (
            <Modal trigger={
                <div className={style["upgrade-button-outer"]}>
                    <Button color="orange" size="small" className={style["upgrade-button-inner"]}>Upgrade</Button>
                </div>
            }
            open={this.state.opened}
            onOpen={this.onOpenHandler}
            onClose={this.onCloseHandler}>
                <Modal.Header>Select a plan</Modal.Header>
                <Modal.Content>
                    {
                        (!this.props.web3) && (
                            <Header color="red">({ERROR_METAMASK_NOT_INSTALLED})</Header>
                        )
                    }

                    {
                        this.state.waitingMessage.show && (
                            <Message icon={true}>
                                <Icon name="circle notched" loading={true} />
                                <Message.Content>
                                <Message.Header>Still processing your membership status</Message.Header>
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
                                list={[
                                    this.state.errorMessage.message,
                                ]}
                            />
                        )
                    }
                    {
                        this.state.successfulMessage.show && (
                            <Message positive={true}>
                                <Message.Header>Congratulations!</Message.Header>
                                {this.state.successfulMessage.message}
                            </Message>
                        )
                    }

                    <Segment placeholder={true}>
                        <Grid columns={2} padded="vertically" stackable={true}>
                        <Grid.Column>
                            <Segment raised={true}>
                                <div className={style["plan-square"]}>
                                    <div className={[style["plan-name"], style["inline-component"], style["plan-citizen-title"], style["title-center"]].join(" ")}>
                                            <h3>Citizen</h3>
                                    </div>
                                    <div className={style.price}>
                                        1 ETH
                                    </div>

                                    <div>
                                        <Segment size="big" textAlign="center" vertical={true}>10 times of poll creations</Segment>
                                        <Segment size="big" textAlign="center" vertical={true}>24/7 Exclusive Customer Service</Segment>
                                    </div>

                                    <Button loading={this.state.inProgress} value={Membership.CITIZEN} content="Upgrade now" primary={true} onClick={this.upgradeButtonOnClick} disabled={(this.state.inProgress) || (this.props.membership !== Membership.NO_BODY) || !this.props.web3} />
                                    {
                                        (this.props.membership === Membership.CITIZEN) && (
                                            <div className={style["note-below"]}>(Already)</div>
                                        )
                                    }

                                </div>
                            </Segment>

                        </Grid.Column>

                        <Grid.Column>
                            <Segment raised={true}>
                                <div className={style["plan-square"]}>
                                    <div className={style["inline-container"]}>
                                        <Label as="a" color="red" ribbon={true} className={style["inline-component"]}>
                                            Best value
                                        </Label>
                                        <div className={[style["plan-name"], style["inline-component"], style["plan-diamond-title"]].join(" ")}>
                                            <h3>Diamond</h3>
                                        </div>
                                    </div>

                                    <div className={style.price}>
                                        10 ETH
                                    </div>

                                    <div>
                                        <Segment size="big" textAlign="center" vertical={true}>Unlimited times of poll creations</Segment>
                                        <Segment size="big" textAlign="center" vertical={true}>24/7 Exclusive Customer Service</Segment>
                                    </div>

                                    <Button loading={this.state.inProgress} value={Membership.DIAMOND} content="Upgrade now" primary={true} onClick={this.upgradeButtonOnClick} disabled={(this.state.inProgress) || ((this.props.membership !== Membership.CITIZEN) && (this.props.membership !== Membership.NO_BODY) || !this.props.web3)} />
                                    {
                                        (this.props.membership === Membership.DIAMOND) && (
                                            <div className={style["note-below"]}>(Already)</div>
                                        )
                                    }
                                </div>
                            </Segment>
                        </Grid.Column>
                        </Grid>
                    </Segment>
                </Modal.Content>
            </Modal>
        );
    }
}

const mapStateToProps = (state: StoreState, ownProps: IMembershipUpgrade.IInnerProps): IMembershipUpgrade.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight,
        membership: state.ethMisc.membership,
        notificationStatus: state.userMisc.notificationStatus,
        userWindowFocus: state.userMisc.userWindowsFocus,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<ETHActionType>, ownProps: IMembershipUpgrade.IInnerProps): IMembershipUpgrade.IPropsFromDispatch => {
    return {
        setMembership: (nextMembership: Membership) => dispatch(setMembership(nextMembership)),
    };
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(MembershipUpgrade));
