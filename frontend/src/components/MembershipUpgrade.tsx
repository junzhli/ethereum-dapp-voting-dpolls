import React, { Dispatch, SyntheticEvent } from "react";
import { connect } from "react-redux";
import { Button, Grid, Icon, Label, Menu, Message, Modal, Segment } from "semantic-ui-react";
import { setMembership } from "../actions/eth";
import { ETHActionType } from "../actions/types/eth";
import { VOTING_CORE_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import { Membership } from "../types";
import { sendTransaction } from "../utils/web3";
import style from "./MembershipUpgrade.module.css";
import { IMembershipUpgrade, IMembershipUpgradeProps, IMembershipUpgradeStates } from "./types/MembershipUpgrade";

const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS;
class MembershipUpgrade extends React.Component<IMembershipUpgradeProps, IMembershipUpgradeStates> {
    private contract: any;
    private checkConfirmedInterval: any;
    private setTimeoutHolder: any;
    private upgradeButtonOnClick: any;
    constructor(props: IMembershipUpgradeProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
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
            },
        };
        this.upgradeButtonOnClick = this.upgradeHandler.bind(this);
    }

    componentWillUnmount() {
        if (this.checkConfirmedInterval) {
            clearInterval(this.checkConfirmedInterval);
        }

        if (this.setTimeoutHolder) {
            clearTimeout(this.setTimeoutHolder);
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
                show: true,
                message: "Waiting for user prompt...",
            },
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
                    message: "Waiting for a few blocks being confirmed",
                },
            });
            this.checkConfirmedInterval = setInterval(async () => {
                try {
                    const receipt = await this.props.web3.eth.getTransactionReceipt(txid);
                    if (receipt) {
                        this.setState({
                            waitingMessage: {
                                show: false,
                                message: null,
                            },
                            successfulMessage: {
                                show: true,
                            },
                        });
                        this.props.setMembership(membership);
                        clearInterval(this.checkConfirmedInterval);
                        this.setTimeoutHolder = setTimeout(() => {
                            this.setState({
                                successfulMessage: {
                                    show: false,
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

    render() {
        return (
            <Modal trigger={<Menu.Item
                name="Upgrade"
                active={false}
            />}>
                <Modal.Header>Select a plan</Modal.Header>
                <Modal.Content>
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
                                <p>Your transaction has been confirmed.</p>
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

                                    <Button value={Membership.CITIZEN} content="Upgrade now" primary={true} onClick={this.upgradeButtonOnClick} disabled={this.props.membership !== Membership.NO_BODY} />
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

                                    <Button value={Membership.DIAMOND} content="Upgrade now" primary={true} onClick={this.upgradeButtonOnClick} disabled={(this.props.membership !== Membership.CITIZEN) && (this.props.membership !== Membership.NO_BODY)} />
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
    };
};

const mapDispatchToProps = (dispatch: Dispatch<ETHActionType>, ownProps: IMembershipUpgrade.IInnerProps): IMembershipUpgrade.IPropsFromDispatch => {
    return {
        setMembership: (nextMembership: Membership) => dispatch(setMembership(nextMembership)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MembershipUpgrade);
