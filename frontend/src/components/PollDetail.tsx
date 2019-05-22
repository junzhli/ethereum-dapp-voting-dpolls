import React, { SyntheticEvent } from "react";
import { ChartData, Pie } from "react-chartjs-2";
import { connect } from "react-redux";
import { Button, Checkbox, Form, Header, Icon, Message, Modal, ButtonProps } from "semantic-ui-react";
import { VOTING_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import { sendTransaction } from "../utils/web3";
import style from "./PollDetail.module.css";
import { IPollDetail, IPollDetailProps, IPollDetailStates } from "./types/PollDetail";
import { getEtherscanTxURL } from "../utils/etherscan";

const NETWORK_ID = process.env.REACT_APP_NETWORK_ID;
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
                message: null,
            },
            errorMessage: {
                show: false,
                message: null,
            },
            votingMessage: {
                selectedIndex: null,
                selectedOption: null,
            },
            successfulMessage: {
                show: false,
                message: null,
            },
            votedOption: null,
            chart: null,
            votesByIndex: null,
        };
        this.handleOptionVoted = this.handleOptionVoted.bind(this);
        this.voteOnSubmitHandler = this.voteOnSubmitHandler.bind(this);
    }

    async componentWillReceiveProps(nextProps: IPollDetailProps) {
        if (this.props !== nextProps) {
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
            } else {
                this.setState({
                    votingMessage: {
                        selectedIndex: null,
                        selectedOption: null,
                    },
                });
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

    async componentDidUpdate(prevProps: IPollDetailProps) {
        if (this.props !== prevProps) {
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

    async vote(option: number) {
        this.setState({
            errorMessage: {
                show: false,
                message: null,
            },
            waitingMessage: {
                show: true,
                message: (
                    <div>Waiting for user prompt...</div>
                ),
            },
        });

        const web3 = this.props.web3;
        const from = this.props.accountAddress as string;
        const to = this.props.address;
        const data = this.props.contract.methods.vote(option).encodeABI();
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
            this.checkConfirmedInterval = setInterval(async () => {
                try {
                    const blockNumber = await this.props.web3.eth.getBlockNumber();
                    const receipt = await this.props.web3.eth.getTransactionReceipt(txid);
                    if (receipt && (lastBlockNumber !== blockNumber)) {
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
                                            (getEtherscanTxURL(NETWORK_ID, txid)) && (
                                                <a target="_blank" rel="noopener noreferrer" href={getEtherscanTxURL(NETWORK_ID, txid) as string}>View on Etherscan</a>
                                            )
                                        }</p>
                                    </div>
                                ),
                            },
                            chart: {
                                option: chartOptions,
                            },
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

    render() {
        return (
            <div className={style["align-right"]}>
                {
                    (this.props.isVoted) && (
                        <div className={style["voted-hint"]}>
                            (Voted)
                        </div>
                    )
                }
                <Modal
                    dimmer={true}
                    trigger={
                        <Button basic={true} color="vk" size="medium">View details</Button>
                    }
                    closeIcon={true}
                    closeOnDimmerClick={false}
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
                                                            disabled={this.props.isVoted || this.props.isExpired}
                                                        />
                                                    </Form.Field>
                                                );
                                            })
                                        }
                                        {
                                            this.state.votingMessage.selectedOption && (
                                                <Form.Field>
                                                    {this.props.isVoted ? ("You haved voted for") : ("You are voting for")} <b>{this.state.votingMessage.selectedOption}</b>
                                                </Form.Field>
                                            )
                                        }
                                    </Form>
                                    {
                                        (this.state.votingMessage.selectedIndex !== null && !this.props.isVoted) && (
                                            <div className={style["voting-button"]}>
                                                <Button value={this.state.votingMessage.selectedIndex} content="Vote!" onClick={this.voteOnSubmitHandler}/>
                                            </div>
                                        )
                                    }
                                </div>
                                {
                                    (this.state.chart) ?  (
                                        <div className={style["inline-right"]}>
                                            <Pie height={180} width={180} data={this.state.chart.option as ChartData<Chart.ChartData>} options={{cutoutPercentage: 8, legend: {display: false}}} />
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
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollDetail.IInnerProps): IPollDetail.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight,
    };
};

export default connect(
    mapStateToProps,
    null,
)(PollDetail);
