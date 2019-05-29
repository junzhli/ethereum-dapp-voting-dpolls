import React from "react";
import { connect } from "react-redux";
import { Header, Icon, Item, Placeholder, Segment } from "semantic-ui-react";
import { StoreState } from "../store/types";
import { Address } from "../types";
import style from "./PollCard.module.css";
import PollDetail from "./PollDetail";
import { IPollCard, IPollCardProps, IPollCardStates, IPollCardStatus } from "./types/PollCard";

class PollCard extends React.Component<IPollCardProps, IPollCardStates> {
    private contract: any;
    private status: {
        [key in IPollCardStatus]: {
            border: "teal" | "grey" | "red" | "orange" | "yellow" | "olive" | "green" | "blue" | "violet" | "purple" | "pink" | "brown" | "black" | undefined,
            icon: "calendar" | "calendar check",
        }
    };
    constructor(props: IPollCardProps) {
        super(props);
        this.contract = this.props.contract;
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
        };
    }

    async checkIfVoted(address: Address | null) {
        if (address === null) {
            return null;
        }

        const isExpired = await this.contract.methods.isVoted(address).call() as boolean;
        return isExpired;
    }

    async componentWillReceiveProps(nextProps: IPollCardProps) {
        if (this.props !== nextProps) {
            const isVoted = await this.checkIfVoted(nextProps.accountAddress);
            if (this.state.externalData) {
                if (isVoted !== this.state.externalData.isVoted) {
                    this.setState({
                        externalData: Object.assign(this.state.externalData, {
                            isVoted,
                        }),
                    });
                }
            }

        }
    }

    async componentDidUpdate(prevProps: IPollCardProps) {
        const isVoted = await this.checkIfVoted(this.props.accountAddress);
        const votesAmount = (await this.contract.methods.votesAmount().call()).toNumber();
        if (this.state.externalData) {
            if (votesAmount !== this.state.externalData.votesAmount) {
                this.setState({
                    externalData: Object.assign(this.state.externalData, {
                        isVoted,
                        votesAmount,
                    }),
                });
            }
        }
    }

    async componentDidMount() {
        const awaitingChairperson = this.contract.methods.chairperson().call();
        const awaitingTitle = this.contract.methods.title().call();
        const awaitingIsVoted = this.checkIfVoted(this.props.accountAddress);
        const amountOptions = Number(await this.contract.methods.optionsAmount().call());
        const awaitingOptions = [];
        for (let i = 0; i < amountOptions; i++) {
            awaitingOptions.push(this.contract.methods.getOptionTitleByIndex(i).call());
        }
        const awaitingVotesAmount = this.contract.methods.votesAmount().call();

        const jsonRpcData = await Promise.all([awaitingChairperson, awaitingTitle, awaitingIsVoted, awaitingVotesAmount, ...awaitingOptions]);

        const chairperson = jsonRpcData[0] as string;
        const title = this.props.web3.utils.hexToUtf8(jsonRpcData[1]) as string;
        const isVoted = jsonRpcData[2];
        const votesAmount = jsonRpcData[3].toNumber() as number;
        const options: string[] = [];
        for (let i = 4; i < amountOptions + 4; i++) {
            options.push(this.props.web3.utils.hexToUtf8(jsonRpcData[i]) as string);
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
        this.props.additionalDataConnecter(this.props.address, title, chairperson);
    }

    renderComponent() {
        let state: "loading" | "non-loaded-completely" | "completed" | null = null;

        if (this.state.externalData && (this.state.externalData.isVoted !== null)) {
            state = "completed";
        } else if (this.state.externalData && (this.state.externalData.isVoted === null)) {
            state = "non-loaded-completely";
        } else {
            state = "loading";
        }

        switch (state) {
            case "loading":
            case "non-loaded-completely":
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
                        <PollDetail
                        web3={this.props.web3}
                        address={this.props.address}
                        title={(this.state.externalData && this.state.externalData.title) as string}
                        options={(this.state.externalData && this.state.externalData.options) as string[]}
                        votesAmount={(this.state.externalData && this.state.externalData.votesAmount) as number}
                        expiryBlockHeight={this.props.expiryBlockNumber}
                        isExpired={this.props.isExpired}
                        isVoted={(this.state.externalData && this.state.externalData.isVoted) as boolean}
                        contract={this.contract} />
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
    };
};

export default connect(
    mapStateToProps,
    null,
)(PollCard);
