import React from "react";
import { connect } from "react-redux";
import { Header, Icon, Item, Placeholder, Segment, Button } from "semantic-ui-react";
import { StoreState } from "../store/types";
import { Address } from "../types";
import style from "./PollCard.module.css";
import { IPollCard, IPollCardProps, IPollCardStates, IPollCardStatus } from "./types/PollCard";
import { IDetail, DBInstance, IOptions } from "../utils/db";
import Routes from "../constants/routes";
import { withRouter } from "react-router-dom";

class PollCard extends React.Component<IPollCardProps, IPollCardStates> {
    private contract: any;
    private detailPath: string;
    private status: {
        [key in IPollCardStatus]: {
            border: "teal" | "grey" | "red" | "orange" | "yellow" | "olive" | "green" | "blue" | "violet" | "purple" | "pink" | "brown" | "black" | undefined,
            icon: "calendar" | "calendar check",
        }
    };
    constructor(props: IPollCardProps) {
        super(props);
        this.contract = this.props.contract;
        this.detailPath = Routes.POLLS_BASE + this.props.address;
        this.status = {
            active: {
                border: "teal",
                icon: "calendar",
            },
            inactive: {
                border: "grey",
                icon: "calendar check",
            },
        };
        this.state = {
            externalData: null,
            detailViewLoading: false,
        };
        this.clickDetailViewHandler = this.clickDetailViewHandler.bind(this);
    }

    async componentWillReceiveProps(nextProps: IPollCardProps) {
        if (this.props !== nextProps) {
            if (!nextProps.detailViewOnly && (nextProps.activeDetailViewAddress === nextProps.address) && (nextProps.activeDetailViewInProgress === false)) {
                this.setState({
                    detailViewLoading: false,
                });
            }

            if ((this.props.blockHeight !== nextProps.blockHeight) || (this.props.accountAddress !== nextProps.accountAddress)) {
                const isVoted = await this.checkIfVoted(nextProps.accountAddress);
                if (this.state.externalData) {
                    if (isVoted !== this.state.externalData.isVoted) {
                        this.setState({
                            externalData: Object.assign(this.state.externalData, {
                                isVoted,
                            }),
                        });

                        if (this.props.detailViewOnly) {
                            if (!this.props.detailViewDataConnecter) {
                                throw new Error("detailViewOnly is available with detailViewDataConnecter provided");
                            }

                            this.props.detailViewDataConnecter({
                                web3: nextProps.web3,
                                web3Rpc: nextProps.web3Rpc,
                                contract: nextProps.contract,
                                address: nextProps.address,
                                title: this.state.externalData && this.state.externalData.title,
                                options: this.state.externalData && this.state.externalData.options,
                                expiryBlockHeight: nextProps.expiryBlockNumber,
                                isExpired: nextProps.isExpired,
                                isVoted,
                                votesAmount: this.state.externalData && this.state.externalData.votesAmount,
                            });
                        }
                    }
                }
            }
        }
    }

    async componentDidUpdate(prevProps: IPollCardProps) {
        if ((this.props.blockHeight !== prevProps.blockHeight) || (this.props.accountAddress !== prevProps.accountAddress)) {
            let isVoted = null;
            if (this.props.web3) {
                isVoted = await this.checkIfVoted(this.props.accountAddress);
            }

            const votesAmount = (await this.contract.methods.votesAmount().call()).toNumber();
            if (this.state.externalData) {
                if (votesAmount !== this.state.externalData.votesAmount) {
                    this.setState({
                        externalData: Object.assign(this.state.externalData, {
                            isVoted,
                            votesAmount,
                        }),
                    });

                    if (this.props.detailViewOnly) {
                        if (!this.props.detailViewDataConnecter) {
                            throw new Error("detailViewOnly is available with detailViewDataConnecter provided");
                        }

                        this.props.detailViewDataConnecter({
                            web3: this.props.web3,
                            web3Rpc: this.props.web3Rpc,
                            contract: this.props.contract,
                            address: this.props.address,
                            title: this.state.externalData && this.state.externalData.title,
                            options: this.state.externalData && this.state.externalData.options,
                            expiryBlockHeight: this.props.expiryBlockNumber,
                            isExpired: this.props.isExpired,
                            isVoted,
                            votesAmount,
                        });
                    }
                }
            }
        }
    }

    async componentDidMount() {
        // find local if available
        let localdbDetail: IDetail | undefined;
        let localdbDetailAvailable: boolean = false;
        try {
            localdbDetail = await DBInstance.detail.get(this.props.address);
            if (localdbDetail) {
                localdbDetailAvailable = true;
            }
        } catch (error) {
            console.log("access db -> detail failed: " + this.props.address);
            console.log(error);
        }

        const awaitingChairperson = (localdbDetail && localdbDetail.chairperson) || this.contract.methods.chairperson().call();
        const awaitingTitle = (localdbDetail && localdbDetail.title) || this.contract.methods.title().call();
        const awaitingIsVoted = this.checkIfVoted(this.props.accountAddress);
        const amountOptions = (localdbDetail && localdbDetail.amountOptions) || Number(await this.contract.methods.optionsAmount().call());

        // find local if available
        const localdbOptionsAvailable: {
            [key: string]: boolean,
        } = {};

        const awaitingOptions = [];
        for (let i = 0; i < amountOptions; i++) {
            let localOptions: IOptions | undefined;
            try {
                localOptions = await DBInstance.options.get({address: this.props.address, index: i});
                if (localOptions) {
                    localdbOptionsAvailable[i] = true;
                }
            } catch (error) {
                console.log("access db -> options failed: " + this.props.address + " " + i);
                console.log(error);
            }

            const awaitingOption = (localOptions && localOptions.option) || this.contract.methods.getOptionTitleByIndex(i).call();
            awaitingOptions.push(awaitingOption);
        }
        const awaitingVotesAmount = this.contract.methods.votesAmount().call();

        const jsonRpcData = await Promise.all([awaitingChairperson, awaitingTitle, awaitingIsVoted, awaitingVotesAmount, ...awaitingOptions]);

        if (!localdbDetailAvailable) {
            // save entity to database asynchronously
            DBInstance.detail.put({
                address: this.props.address,
                chairperson: jsonRpcData[0],
                title: jsonRpcData[1],
                amountOptions,
            }).catch((error) => {
                console.log("save db -> detail failed: " + this.props.address);
                console.log(error);
            });
        }

        const chairperson = jsonRpcData[0] as string;
        const title = this.props.web3Rpc.utils.hexToUtf8(jsonRpcData[1]) as string;
        const isVoted = jsonRpcData[2];
        const votesAmount = jsonRpcData[3].toNumber() as number;
        const options: string[] = [];
        for (let i = 4; i < amountOptions + 4; i++) {
            options.push(this.props.web3Rpc.utils.hexToUtf8(jsonRpcData[i]) as string);

            const optionIndex = i - 4;
            if (!(optionIndex in localdbOptionsAvailable)) {
                // save entity to database asynchronously
                DBInstance.options.put({
                    address: this.props.address,
                    index: optionIndex,
                    option: jsonRpcData[i],
                }).catch((error) => {
                    console.log("save db -> options failed: " + this.props.address + " " + optionIndex);
                    console.log(error);
                });
            }
        }

        this.setState({
            externalData: {
                chairperson,
                isVoted,
                options,
                title,
                votesAmount,
            },
        });

        if (this.props.detailViewOnly) {
            if (!this.props.detailViewDataConnecter) {
                throw new Error("detailViewOnly is available with detailViewDataConnecter provided");
            }

            this.props.detailViewDataConnecter({
                web3: this.props.web3,
                web3Rpc: this.props.web3Rpc,
                contract: this.props.contract,
                address: this.props.address,
                title,
                options,
                expiryBlockHeight: this.props.expiryBlockNumber,
                isExpired: this.props.isExpired,
                isVoted,
                votesAmount,
            });
        }

        if (this.props.additionalDataConnecter) {
            this.props.additionalDataConnecter(this.props.address, title, chairperson);
        }
    }

    async checkIfVoted(address: Address | null) {
        if (address === null) {
            return null;
        }

        const isExpired = await this.contract.methods.isVoted(address).call() as boolean;
        return isExpired;
    }

    clickDetailViewHandler() {
        if (((this.props.activeDetailViewAddress === this.props.address) && this.props.activeDetailViewInProgress) || this.state.detailViewLoading) {
            return;
        }
        this.props.history.push(this.detailPath);
        this.setState({
            detailViewLoading: true,
        });
    }

    renderComponent() {
        let state: "detail-view-only" | "loading" | "non-loaded-completely/web3-not-injected" | "completed" | null = null;

        if (this.props.detailViewOnly) {
            state = "detail-view-only";
        } else if (this.state.externalData && (this.state.externalData.isVoted !== null)) {
            state = "completed";
        } else if (this.state.externalData && (this.state.externalData.isVoted === null)) {
            state = "non-loaded-completely/web3-not-injected";
        } else {
            state = "loading";
        }

        switch (state) {
            case "detail-view-only":
                return (<div className={style.hidden} />);
            case "loading":
                return (
                    <Segment className={!this.props.display ? style.hidden : undefined} color={this.status.inactive.border}>
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
                );
            case "non-loaded-completely/web3-not-injected":
            case "completed":
                return (
                    <Segment className={!this.props.display ? style.hidden : undefined} color={this.status[this.props.status].border}>
                        <div className={style["top-bottom-border"]}>
                            <Icon size="huge" name={this.status[this.props.status].icon} />
                        </div>
                        <Item.Content className={style["top-bottom-border"]}>
                            <Header as="h2">
                                {this.state.externalData && this.state.externalData.title}
                            </Header>

                            <Item.Extra>
                                <Icon color="olive" name="archive" /> {this.props.address}
                            </Item.Extra>
                            <Item.Extra>
                                <Icon color="red" name="user outline" /> {this.state.externalData && this.state.externalData.chairperson}
                            </Item.Extra>
                            <Item.Extra>
                                {(this.props.isExpired) ? <Icon color="red" name="close" /> : <Icon color="green" name="check" />} Expired at {this.props.expiryBlockNumber} blocks
                            </Item.Extra>
                            <Item.Extra>
                                <Icon color="brown" name="users" /> {this.state.externalData && this.state.externalData.votesAmount} vote(s)
                            </Item.Extra>
                        </Item.Content>
                        <div className={
                            (this.state.externalData && this.state.externalData.isVoted) ? [style["align-right"], style["show-voted-hint"]].join(" ") : style["align-right"]
                        }>
                            {
                                (this.state.externalData && this.state.externalData.isVoted) && (
                                    <div className={style["voted-hint"]}>
                                        (Voted)
                                    </div>
                                )
                            }
                            <Button basic={true} color="vk" size="medium" onClick={this.clickDetailViewHandler}>View details<Icon name="angle right" /></Button>
                        </div>
                    </Segment>
                );
        }
    }

    render() {
        return this.renderComponent();
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollCard.IInnerProps): IPollCard.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight,
        activeDetailViewInProgress: state.pollMisc.activeDetailAddress.inProgress,
        activeDetailViewAddress: state.pollMisc.activeDetailAddress.address,
    };
};

export default withRouter(connect(
    mapStateToProps,
    null,
)(PollCard));
