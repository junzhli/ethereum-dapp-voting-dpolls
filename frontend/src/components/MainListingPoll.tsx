import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Header, Icon, Item, Loader, Segment, Menu } from "semantic-ui-react";
import { setStatistics, removeMonitoringPoll, setSearchResultsAmount } from "../actions/poll";
import { BlockHeightType, AddressType } from "../actions/types/eth";
import { PollActionType } from "../actions/types/poll";
import { VOTING_ABI, VOTING_CORE_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import style from "./MainListingPoll.module.css";
import PollCard from "./PollCard";
import { IMainListingPoll, IMainListingPollProps, IMainListingPollState, PollInitialMetadata, AdditionalData, FilteredViewOptions } from "./types/MainListingPoll";
import { NOTIFICATION_TITLE } from "../constants/project";
import Fuse from "fuse.js";
import { setSearchBar } from "../actions/user";
import { UserActionType } from "../actions/types/user";
import { withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import Routes from "../constants/routes";
import bluebird from "bluebird";
import bluebirdConfig from "../commons/bluebirdConfig";
import Toast from "./Toast";
import { DBInstance, IListing } from "../utils/db";

const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS;

class MainListingPoll extends React.Component<IMainListingPollProps, IMainListingPollState> {
    private contract: any;
    private additionalData: AdditionalData[];
    private pollCardsSearchable: number | null;
    private showNoSearchResult: {
        [key: string]: boolean,
        active: boolean,
        inactive: boolean,
        all: boolean,
    };
    private initialMetadata: {
        [key: string]: PollInitialMetadata;
    };
    constructor(props: IMainListingPollProps) {
        super(props);
        this.contract = new this.props.web3Rpc.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.additionalData = [];
        this.initialMetadata = {};
        this.pollCardsSearchable = null;
        this.showNoSearchResult = {
            active: false,
            inactive: false,
            all: false,
        };
        this.state = {
            polls: null,
            amountPolls: null,
            inactivePolls: null,
            activePolls: null,
            inactiveCollapse: true,
            activeCollapse: true,
            filteredPolls: null,
            filteredView: "all",
        };
        this.inactiveCollapseToggle = this.inactiveCollapseToggle.bind(this);
        this.activeCollapseToggle = this.activeCollapseToggle.bind(this);
        this.syncAdditionalData = this.syncAdditionalData.bind(this);
        this.linkPoll = this.linkPoll.bind(this);
        this.selectedFilteredView = this.selectedFilteredView.bind(this);
        bluebird.config(bluebirdConfig);
    }

    async componentWillReceiveProps(nextProps: IMainListingPollProps) {
        if (nextProps !== this.props) {
            if (nextProps.userSearchKeywords !== this.props.userSearchKeywords) {
                if (nextProps.userSearchKeywords !== null) {
                    const filteredPolls = this.searchPolls(nextProps.userSearchKeywords);
                    this.props.setSearchResultsAmount(filteredPolls.length);
                    this.setState({
                        filteredPolls,
                    });
                } else {
                    // set to inital state
                    Object.keys(this.showNoSearchResult).forEach((key) => {
                        this.showNoSearchResult[key] = false;
                    });
                    this.props.setSearchResultsAmount(null);
                    this.setState({
                        filteredPolls: null,
                    });
                }
            }
        }
    }

    async componentDidMount() {
        await this.refreshPolls();
        this.pollCardsSearchable = 0;
    }

    async componentDidUpdate(prevProps: IMainListingPollProps) {
        if (this.props !== prevProps) {
            await this.refreshPolls();
        }
    }

    selectedFilteredView(filteredView: FilteredViewOptions) {
        this.setState({
            filteredView,
        });
    }

    updateInitialMetadataStorage(polls: PollInitialMetadata[]) {
        polls.forEach((poll, reversedIndex: number) => {
            const indexed: {
                [key: string]: PollInitialMetadata,
            } = {};
            const index = polls.length - 1 - reversedIndex;
            indexed[index] = poll;
            Object.assign(this.initialMetadata, indexed);
        });
    }

    linkPoll(pollAddress: AddressType) {
        this.props.history.replace(Routes.POLLS_BASE + pollAddress);
    }

    searchPolls(keywords: string) {
        const options: Fuse.FuseOptions<AdditionalData> = {
            keys: ["chairperson", "contractAddress", "title"],
            id: "contractAddress",
        };

        const fuse = new Fuse(this.additionalData, options);
        const results = fuse.search(keywords) as unknown as AddressType[];
        return results;
    }

    syncAdditionalData(address: AddressType, title: string, chairperson: AddressType) {
        if (this.pollCardsSearchable === null) {
            return;
        }

        const beUpdated: AdditionalData = {
            contractAddress: address,
            chairperson,
            title,
        };

        const atIndex = this.additionalData.findIndex((data) => {
            return data.contractAddress === beUpdated.contractAddress;
        });

        if (atIndex !== -1) {
            Object.assign(this.additionalData[atIndex], beUpdated);
        } else {
            this.additionalData.push(beUpdated);
        }

        this.pollCardsSearchable += 1;
        if (this.pollCardsSearchable === this.state.amountPolls) {
            this.props.setSearchBar(true);
        }
    }

    async refreshPolls() {
        const data = await this.fetchPolls();

        if (data) {
            const { amountPolls, polls } = data;
            const { activePolls, inactivePolls } = this.filePolls(polls);

            this.props.setPollStatistics(amountPolls, activePolls.length);

            const notifiedVotings: AddressType[] = [];
            polls.forEach((poll) => {
                if (this.props.monitoring.includes(poll.address)) {
                    notifiedVotings.push(poll.address);

                    this.props.history.replace("/");

                    const title = "Poll Creation";
                    const detail = (<div>Your poll have just been published! <Icon size="small" name="external alternate" onClick={this.linkPoll.bind(this, poll.address)} /></div>);
                    toast(<Toast title={title} detail={detail} />);

                    if (!this.props.userWindowFocus && this.props.notificationStatus === true) {
                        const notification = new Notification(NOTIFICATION_TITLE, {
                            body: "Your poll have just been published!",
                        });
                    }
                }
            });

            if (notifiedVotings.length !== 0) {
                this.props.removeMonitoringPolls(notifiedVotings);
            }

            if (this.state.amountPolls && this.state.amountPolls < amountPolls) {
                this.props.setSearchBar(false);
            }

            this.setState({
                polls,
                amountPolls,
                activePolls,
                inactivePolls,
            });
        }
    }

    checkIfExpired(blockHeight: BlockHeightType) {
        if (this.props.blockHeight === null) {
            return null;
        }

        const isExpired = (this.props.blockHeight >= blockHeight) ? true : false;
        return isExpired;
    }

    filePolls(polls: PollInitialMetadata[]) {
        const activePolls: PollInitialMetadata[] = [];
        const inactivePolls: PollInitialMetadata[] = [];

        polls.forEach((poll) => {
            (!poll.isExpired) ? activePolls.push(poll) : inactivePolls.push(poll);
        });

        return {
            activePolls,
            inactivePolls,
        };
    }

    async fetchPolls() {
        if (this.props.blockHeight === -1) {
            return null;
        }

        const amountPolls: number = (await this.contract.methods.getAmountVotings().call()).toNumber();
        const getPollInitialMetadata = async (index: number) => {
            // find local if available
            let localdb: IListing | undefined;
            let localdbAvailable: boolean = false;
            try {
                localdb = await DBInstance.listing.get(index);
                if (localdb) {
                    localdbAvailable = true;
                }
            } catch (error) {
                console.log("access db -> listing failed: " + index);
                console.log(error);
            }

            const address = (index in this.initialMetadata && this.initialMetadata[index].address) || (localdb && localdb.address) || await this.contract.methods.getVotingItemByIndex(index).call();
            const contract = (index in this.initialMetadata && this.initialMetadata[index].contract) || new this.props.web3Rpc.eth.Contract(VOTING_ABI, address);
            const expiryBlockNumber = (index in this.initialMetadata && this.initialMetadata[index].expiryBlockNumber) || (localdb && localdb.expiryBlockNumber) || (await contract.methods.expiryBlockNumber().call()).toNumber();
            const isExpired = this.checkIfExpired(expiryBlockNumber) as boolean;

            if (!localdbAvailable) {
                // save entity to database asynchronously
                DBInstance.listing.put({
                    index,
                    address,
                    expiryBlockNumber,
                }).catch((error) => {
                    console.log("save db -> listing failed: " + index);
                    console.log(error);
                });
            }

            const pollInitialMetadata: PollInitialMetadata = {
                address,
                contract,
                expiryBlockNumber,
                isExpired,
            };
            return pollInitialMetadata;
        };

        const reversedIndex = Array.from(Array(amountPolls), (value, index) => {
            return amountPolls - 1 - index;
        });
        const polls = await (bluebird.map(reversedIndex, (index) => {
            return getPollInitialMetadata(index);
        }, {
            concurrency: 100,
        }));

        this.updateInitialMetadataStorage(polls);

        return {
            amountPolls,
            polls,
        };
    }

    inactiveCollapseToggle() {
        this.setState({
            inactiveCollapse: !this.state.inactiveCollapse,
        });
    }

    activeCollapseToggle() {
        this.setState({
            activeCollapse: !this.state.activeCollapse,
        });
    }

    renderFiltered(polls: PollInitialMetadata[], filter: AddressType[], listType: FilteredViewOptions) {
        const categoriedPolls = polls.map((pollInitialMetadata) => {
            if (filter.includes(pollInitialMetadata.address)) {
                return Object.assign(pollInitialMetadata, {
                    filtered: true,
                });
            } else {
                return Object.assign(pollInitialMetadata, {
                    filtered: false,
                });
            }
        });

        if (categoriedPolls.filter((pollInitialMetadata) => pollInitialMetadata.filtered === true).length === 0) {
            switch (listType) {
                case "all":
                    this.showNoSearchResult.all = true;
                    break;
                case "active":
                    this.showNoSearchResult.active = true;
                    break;
                case "inactive":
                    this.showNoSearchResult.inactive = true;
                    break;
                default:
                    throw new Error("Toggle showNoSearchResult off: unsupported list type");
            }

            return (
                categoriedPolls.map((pollInitialMetadata) => {
                    const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;

                    return <PollCard display={false} status="active" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />;
                })
            );
        }

        switch (listType) {
            case "all":
                this.showNoSearchResult.all = false;
                break;
            case "active":
                this.showNoSearchResult.active = false;
                break;
            case "inactive":
                this.showNoSearchResult.inactive = false;
                break;
            default:
                throw new Error("Toggle showNoSearchResult on: unsupported list type");
        }
        return (
            categoriedPolls.map((pollInitialMetadata) => {
                const { address, isExpired, expiryBlockNumber, contract, filtered } = pollInitialMetadata;

                return (filtered) ? (
                    <PollCard display={true} status="active" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
                ) : (
                    <PollCard display={false} status="active" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
                );
            })
        );
    }

    renderNoMatchesAvailable() {
        return (
            <Header className={style["no-search-result"]} textAlign="center" size="small">
                <div>
                    No matches found...
                </div>
            </Header>
        );
    }

    renderNoPollsAvailable() {
        return (
            <Segment>
                <Header textAlign="center" size="small">
                    <div>
                        No polls are available...
                    </div>
                </Header>
            </Segment>
        );
    }

    renderContent() {
        let state: "loading" | "completed" | null = null;

        if (this.state.amountPolls === null) {
            state = "loading";
        } else {
            state = "completed";
        }

        switch (state) {
            case "loading":
                return (
                    <div>
                        <Loader active={true} inline="centered" />
                    </div>
                );
            case "completed":
                if (this.state.amountPolls === 0) {
                    return (
                        <Item.Group>
                            <div className={style["no-poll"]}>
                                <Icon name="archive" size="massive" />
                                <Header>
                                    No poll for now...
                                </Header>
                            </div>
                        </Item.Group>
                    );
                }

                switch (this.state.filteredView) {
                    case "all":
                        return (
                            <div className={style["poll-content"]}>
                                {
                                    (this.state.polls && this.state.polls.length !== 0) ? (
                                        <div>
                                            {
                                                (this.state.filteredPolls !== null) ? this.renderFiltered(this.state.polls, this.state.filteredPolls, "all") : (
                                                    this.state.polls.map((pollInitialMetadata) => {
                                                        const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;
                                                        return (
                                                            <PollCard display={true} status="active" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
                                                        );
                                                    })
                                                )
                                            }
                                            {
                                                (this.showNoSearchResult.all) && this.renderNoMatchesAvailable()
                                            }
                                        </div>
                                    ) : this.renderNoPollsAvailable()
                                }
                            </div>
                        );
                    case "active":
                        return (
                            <div className={style["poll-content"]}>
                                {
                                    (this.state.activePolls && this.state.activePolls.length !== 0) ? (
                                        <div>
                                            {
                                                (this.state.filteredPolls !== null) ? this.renderFiltered(this.state.activePolls, this.state.filteredPolls, "active") : (
                                                    this.state.activePolls.map((pollInitialMetadata) => {
                                                        const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;
                                                        return (
                                                            <PollCard display={true} status="inactive" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
                                                        );
                                                    })
                                                )
                                            }
                                            {
                                                (this.showNoSearchResult.active) && this.renderNoMatchesAvailable()
                                            }
                                        </div>
                                    ) : this.renderNoPollsAvailable()
                                }
                            </div>
                        );
                    case "inactive":
                        return (
                            <div className={style["poll-content"]}>
                                {
                                    (this.state.inactivePolls && this.state.inactivePolls.length !== 0) ? (
                                        <div>
                                            {
                                                (this.state.filteredPolls !== null) ? this.renderFiltered(this.state.inactivePolls, this.state.filteredPolls, "inactive") : (
                                                    this.state.inactivePolls.map((pollInitialMetadata) => {
                                                        const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;
                                                        return (
                                                            <PollCard display={true} status="inactive" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
                                                        );
                                                    })
                                                )
                                            }
                                            {
                                                (this.showNoSearchResult.inactive) && this.renderNoMatchesAvailable()
                                            }
                                        </div>
                                    ) : this.renderNoPollsAvailable()
                                }
                            </div>
                        );
                }
        }
    }

    renderMenu() {
        return (
            <Menu pointing={true} secondary={true}>
                <Menu.Item
                    name="all"
                    active={this.state.filteredView === "all"}
                    onClick={this.selectedFilteredView.bind(this, "all")}
                />
                <Menu.Item
                    name="active"
                    active={this.state.filteredView === "active"}
                    onClick={this.selectedFilteredView.bind(this, "active")}
                />
                <Menu.Item
                    name="inactive"
                    active={this.state.filteredView === "inactive"}
                    onClick={this.selectedFilteredView.bind(this, "inactive")}
                />
            </Menu>
        );
    }

    render() {
        return (
            <div>
                <Header size="huge">Latest polls</Header>
                {this.renderMenu()}
                {this.renderContent()}
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, ownProps: IMainListingPoll.IInnerProps): IMainListingPoll.IStateFromProps => {
    return {
        blockHeight: state.ethMisc.blockHeight,
        monitoring: state.pollMisc.monitoring,
        notificationStatus: state.userMisc.notificationStatus,
        userSearchKeywords: state.pollMisc.keywords,
        userWindowFocus: state.userMisc.userWindowsFocus,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<PollActionType | UserActionType>, ownProps: IMainListingPoll.IInnerProps): IMainListingPoll.IPropsFromDispatch => {
    return {
        setPollStatistics: (amount: number, active: number) => dispatch(setStatistics(amount, active)),
        removeMonitoringPolls: (addresses: AddressType[]) => dispatch(removeMonitoringPoll(addresses)),
        setSearchResultsAmount: (amount: number | null) => dispatch(setSearchResultsAmount(amount)),
        setSearchBar: (enabled: boolean) => dispatch(setSearchBar(enabled)),
    };
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainListingPoll));
