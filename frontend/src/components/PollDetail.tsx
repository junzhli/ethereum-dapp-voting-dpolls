import React, { SyntheticEvent, Dispatch } from "react";
import { ChartData, Pie } from "react-chartjs-2";
import { connect } from "react-redux";
import { Button, Checkbox, Form, Header, Icon, Message, Modal, ButtonProps, ModalProps } from "semantic-ui-react";
import { VOTING_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import { sendTransaction } from "../utils/web3";
import style from "./PollDetail.module.css";
import { IPollDetail, IPollDetailProps, IPollDetailStates } from "./types/PollDetail";
import { getEtherscanTxURL } from "../utils/etherscan";
import Routes from "../constants/routes";
import { withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { ERROR_METAMASK_NOT_INSTALLED } from "../constants/project";
import Toast from "./Toast";
import { AddressType, BlockHeightType, ETHActionType } from "../actions/types/eth";
import { setActivePollDetail, setActivePollDetailInProgress, addMonitoringVotedPoll, setVoteInProgress, removeVoteInProgress } from "../actions/poll";
import { PollActionType } from "../actions/types/poll";
import { setLoadingHint } from "../actions/user";
import { UserActionType } from "../actions/types/user";
import { setBlockHeight } from "../actions/eth";

const NETWORK_ID = process.env.REACT_APP_NETWORK_ID;
class PollDetail extends React.Component<IPollDetailProps, IPollDetailStates> {
    private checkConfirmedInterval: any;
    private setTimeoutHolder: any;
    private contract: any;
    private txInProgress: string | null;
    private stillInProgress: boolean;

    constructor(props: IPollDetailProps) {
        super(props);
        this.contract = new this.props.web3Rpc.eth.Contract(VOTING_ABI, this.props.address);
        this.stillInProgress = false;
        // restore state if something is still processing (e.g. waiting transaction)
        if (this.props.address in this.props.voteInProgress) {
            this.stillInProgress = true;
        }

        this.txInProgress = (this.stillInProgress) ? (this.props.voteInProgress[this.props.address].txid) : null;
        this.checkConfirmedInterval = (this.stillInProgress) ? this.setTxCheck() : null;
        this.setTimeoutHolder = null;
        this.state = {
            waitingMessage: (this.stillInProgress) ? this.getWaitingTxConfirmedState() : {
                show: false,
                message: null,
            },
            errorMessage: {
                show: false,
                message: null,
            },
            votingMessage: {
                selectedIndex: (this.stillInProgress) ? (this.props.voteInProgress[this.props.address].votedIndex) : null,
                selectedOption: (this.stillInProgress) ? (this.props.options[this.props.voteInProgress[this.props.address].votedIndex]) : null,
            },
            successfulMessage: {
                show: false,
                message: null,
            },
            chart: null,
            votesByIndex: null,
            opened: false,
            inProgress: (this.stillInProgress) ? true : false,
            waitingVerified: false,
        };
        this.handleOptionVoted = this.handleOptionVoted.bind(this);
        this.voteOnSubmitHandler = this.voteOnSubmitHandler.bind(this);
        this.onCloseHandler = this.onCloseHandler.bind(this);
    }

    async componentWillReceiveProps(nextProps: IPollDetailProps) {
        if (this.props !== nextProps) {
            if ((this.props.votesAmount !== nextProps.votesAmount) && nextProps.votesAmount !== 0) {
                const votesByIndex = await this.fetchVotesByIndex();
                this.setState({
                    votesByIndex,
                });

                const chartOptions = this.fetchChartOption();
                this.setState({
                    chart: {
                        option: chartOptions,
                    },
                });
            }

            if (nextProps.isVoted) {
                try {
                    const selectedIndex = (await this.contract.methods.getMyOption(nextProps.accountAddress).call()).toNumber();
                    this.setState({
                        votingMessage: {
                            selectedIndex,
                            selectedOption: this.props.options[selectedIndex],
                        },
                    });
                } catch (error) {
                    console.log("getMyOption failed");
                    console.log(error);
                }
            }
        }
    }

    async componentDidMount() {
        const votesByIndex = await this.fetchVotesByIndex();
        this.setState({
            votesByIndex,
        });

        if (this.props.votesAmount !== 0) {
            const chartOptions = this.fetchChartOption();
            this.setState({
                chart: {
                    option: chartOptions,
                },
            });
        }
    }

    async componentWillMount() {
        if (this.props.isVoted) {
            const selectedIndex = (await this.contract.methods.getMyOption(this.props.accountAddress).call()).toNumber();
            this.setState({
                votingMessage: {
                    selectedIndex,
                    selectedOption: this.props.options[selectedIndex],
                },
            });
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

    componentDidUpdate(prevProps: IPollDetailProps) {
        if (!this.state.opened) {
            const dataArrived = this.checkAllDataReady();
            if (dataArrived) {
                this.props.setActiveDetailViewInProgress(false);
                this.props.setLoadingHint(false);
                this.setState({
                    opened: true,
                });
            }
        }
    }

    checkAllDataReady() {
        if (this.state.votesByIndex) {
            if (this.props.votesAmount !== 0 && !this.state.chart) {
                return false;
            }

            if (this.props.isVoted && !this.state.votingMessage) {
                return false;
            }

            return true;
        } else {
            return false;
        }
    }

    onCloseHandler(event: React.MouseEvent<HTMLElement, MouseEvent>, data: ModalProps) {
        if (data.open === true) {
            this.setState({
                opened: false,
            });

            if (this.txInProgress) {
                this.props.addVoteInProgress(this.props.address, this.txInProgress, this.state.votingMessage.selectedIndex as number);
            }

            if (this.state.inProgress) {
                const title = "Vote";
                const detail = "Your submission is still in progress...";
                toast(<Toast title={title} detail={detail} />);
            }

            if (this.state.waitingVerified) {
                this.props.addMonitoringVotedPoll(this.props.address);
            }

            this.props.history.push(Routes.ROOT);
            this.props.setActiveDetailAddress(null);
        }
    }

    dynamicColors() {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    async voteOnSubmitHandler(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, data: ButtonProps) {
        await this.vote(data.value);
    }

    setTxCheck() {
        return setInterval(async () => {
            try {
                const receipt = await this.props.web3Rpc.eth.getTransactionReceipt(this.txInProgress);
                if (receipt && ((receipt.blockNumber - 1) <= this.props.blockHeight)) {
                    const blockNumber = await this.props.web3Rpc.eth.getBlockNumber();
                    if (blockNumber !== this.props.blockHeight) {
                        this.props.setBlockHeight(blockNumber);
                    }
                    const chartOptions = await this.fetchChartOption();
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
                                        (getEtherscanTxURL(NETWORK_ID, this.txInProgress as string)) && (
                                            <a target="_blank" rel="noopener noreferrer" href={getEtherscanTxURL(NETWORK_ID, this.txInProgress as string) as string}>View on Etherscan</a>
                                        )
                                    }</p>
                                </div>
                            ),
                        },
                        chart: {
                            option: chartOptions,
                        },
                        inProgress: false,
                        waitingVerified: false,
                    });

                    this.props.removeVoteInProgress(this.props.address);
                    clearInterval(this.checkConfirmedInterval);
                    if (this.setTimeoutHolder) {
                        clearTimeout(this.setTimeoutHolder);
                    }
                    this.setTimeoutHolder = setTimeout(() => {
                        this.setState({
                            successfulMessage: {
                                show: false,
                                message: null,
                            },
                        });
                    }, 5000);
                    this.txInProgress = null;
                }
            } catch (error) {
                // we skip any error
                console.log("checkConfirmedInterval error occurred: " + error);
            }

        }, 1000);
    }

    getWaitingTxConfirmedState() {
        if (!this.txInProgress) {
            throw new Error("txInProgress should not be null");
        }

        return {
            show: true,
            message: (
                <div>
                    Waiting for the transaction being confirmed. {
                        (getEtherscanTxURL(NETWORK_ID, this.txInProgress)) && (
                            <a target="_blank" rel="noopener noreferrer" href={getEtherscanTxURL(NETWORK_ID, this.txInProgress) as string}>View on Etherscan</a>
                        )
                    }
                </div>
            ),
        };
    }

    async vote(option: number) {
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
        const to = this.props.address;
        const data = this.props.contract.methods.vote(option).encodeABI();
        try {
            this.txInProgress = await sendTransaction(
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
                waitingMessage: this.getWaitingTxConfirmedState(),
                waitingVerified: true,
            });

            if (this.checkConfirmedInterval) {
                clearInterval(this.checkConfirmedInterval);
            }
            this.checkConfirmedInterval = this.setTxCheck();
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

    handleOptionVoted(event: SyntheticEvent, object: any) {
        this.setState({
            votingMessage: {
                selectedIndex: object.value,
                selectedOption: object.name,
            },
        });
    }

    async fetchVotesByIndex() {
        const votesByIndex: number[] = [];
        for (let i = 0; i < this.props.options.length; i++) {
            const votes = (await this.contract.methods.getVotesByIndex(i).call()).toNumber();
            votesByIndex.push(votes);
        }
        return votesByIndex;
    }

    fetchChartOption() {
        const titlesByIndex = [];
        const randomBackgroundsByIndex = [];
        const votesByIndex = this.state.votesByIndex || new Array(this.props.options.length).fill(0);
        for (let i = 0; i < this.props.options.length; i++) {
            const title = this.props.options[i];
            titlesByIndex.push(title);
            const color = this.dynamicColors();
            randomBackgroundsByIndex.push(color);
        }

        return {
            labels: titlesByIndex,
            datasets: [{
                data: votesByIndex,
                backgroundColor: randomBackgroundsByIndex,
                hoverBackgroundColor: randomBackgroundsByIndex,
            }],
        };
    }

    renderComponent() {
        return (
            <Modal
                dimmer={true}
                closeIcon={true}
                closeOnDimmerClick={false}
                open={this.state.opened}
                onClose={this.onCloseHandler}
            >
                <Modal.Header>
                    {this.props.title}
                </Modal.Header>
                <Modal.Content image={true}>
                    <Modal.Description>
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
                                    list={[
                                        this.state.errorMessage.message,
                                    ]}
                                />
                            )
                        }
                        {
                            this.state.successfulMessage.show && (
                                <Message positive={true}>
                                    <Message.Header>You vote successfully!</Message.Header>
                                    {this.state.successfulMessage.message}
                                </Message>
                            )
                        }
                        <div className={style["inline-container"]}>
                            <div className={style["inline-left"]}>
                                {
                                    (!this.props.web3) && (
                                        <Header color="red">({ERROR_METAMASK_NOT_INSTALLED})</Header>
                                    )
                                }
                                <Form className={style["voting-box"]} size="huge">
                                    {
                                        this.props.options.map((option, index) => {
                                            return (
                                                <Form.Field key={this.props.address + " " + index}>
                                                    <Checkbox
                                                        radio={true}
                                                        label={
                                                            (this.state.votesByIndex && this.props.votesAmount > 0) ? (
                                                                option + " (" + Math.floor((this.state.votesByIndex[index] / this.props.votesAmount) * 100) + "%)"
                                                            ) : option
                                                        }
                                                        name={option}
                                                        value={index}
                                                        checked={this.state.votingMessage.selectedIndex === index}
                                                        onChange={this.handleOptionVoted}
                                                        disabled={!this.props.web3 || this.props.isVoted || this.props.isExpired || this.state.inProgress}
                                                    />
                                                </Form.Field>
                                            );
                                        })
                                    }
                                    {
                                        this.state.votingMessage.selectedOption && (
                                            <Form.Field>
                                                {this.props.isVoted ? ("You have voted for") : ("You are voting for")} <b>{this.state.votingMessage.selectedOption}</b>
                                            </Form.Field>
                                        )
                                    }
                                </Form>
                                {
                                    (this.state.votingMessage.selectedIndex !== null && !this.props.isVoted) && (
                                        <div className={style["voting-button"]}>
                                            <Button disabled={this.state.inProgress} loading={this.state.inProgress} value={this.state.votingMessage.selectedIndex} content="Vote!" onClick={this.voteOnSubmitHandler}/>
                                        </div>
                                    )
                                }
                            </div>
                            {
                                (this.state.chart) ?  (
                                    <div className={style["inline-right"]}>
                                        <Pie height={200} width={400} data={this.state.chart.option as ChartData<Chart.ChartData>} options={{cutoutPercentage: 50, layout: {padding: {bottom: 20}}, animation: {duration: 1600}, legend: {display: true, position: "left"}}} />
                                    </div>
                                ) : (
                                    <div className={style["inline-right"]}>
                                        <Header size="medium" color="grey">
                                            (No enough data available in the poll)
                                        </Header>
                                    </div>
                                )
                            }
                        </div>
                        {
                            this.props.isExpired && (
                                <div className={[style.stamp, style.ended].join(" ")}>
                                    Poll ended
                                </div>
                            )
                        }
                    </Modal.Description>
                </Modal.Content>
            </Modal>
        );
    }

    render() {
        return this.renderComponent();
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollDetail.IInnerProps): IPollDetail.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight,
        activeDetailAddress: state.pollMisc.activeDetailAddress.address,
        activeDetailViewInProgress: state.pollMisc.activeDetailAddress.inProgress,
        voteInProgress: state.pollMisc.voteInProgress,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<PollActionType | UserActionType | ETHActionType>, ownProps: IPollDetail.IInnerProps): IPollDetail.IPropsFromDispatch => {
    return {
        setActiveDetailAddress: (address: AddressType | null) => dispatch(setActivePollDetail(address)),
        setActiveDetailViewInProgress: (inProgress: boolean) => dispatch(setActivePollDetailInProgress(inProgress)),
        addMonitoringVotedPoll: (address: AddressType) => dispatch(addMonitoringVotedPoll([address])),
        addVoteInProgress: (address: AddressType, txid: string, votedIndex: number) => dispatch(setVoteInProgress(address, txid, votedIndex)),
        removeVoteInProgress: (address: AddressType) => dispatch(removeVoteInProgress(address)),
        setLoadingHint: (show: boolean) => dispatch(setLoadingHint(show)),
        setBlockHeight: (blockHeight: BlockHeightType) => dispatch(setBlockHeight(blockHeight)),
    };
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(PollDetail));
