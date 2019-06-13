import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Header, Icon, Item, Loader, Segment, Menu } from "semantic-ui-react";
import { setStatistics, removeMonitoringCreatedPoll, setSearchResultsAmount, setActivePollDetail, setActivePollDetailInProgress, removeMonitoringVotedPoll, removeVoteInProgress } from "../actions/poll";
import { BlockHeightType, AddressType } from "../actions/types/eth";
import { PollActionType } from "../actions/types/poll";
import { VOTING_ABI, VOTING_CORE_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import style from "./MainListingPoll.module.css";
import PollCard from "./PollCard";
import { IMainListingPoll, IMainListingPollProps, IMainListingPollState, PollInitialMetadata, AdditionalData, FilteredViewOptions } from "./types/MainListingPoll";
import { NOTIFICATION_TITLE } from "../constants/project";
import Fuse from "fuse.js";
import { setSearchBar, setLoadingHint } from "../actions/user";
import { UserActionType } from "../actions/types/user";
import { withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import Routes from "../constants/routes";
import bluebird from "bluebird";
import bluebirdConfig from "../commons/bluebirdConfig";
import Toast from "./Toast";
import { DBInstance, IListing } from "../utils/db";
import { PollDetailArguments } from "./types/PollDetail";
import PollDetail from "./PollDetail";

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
    private monitoringVotedPollLock: {
        [key: string]: true;
    }; // lock down to single op at the same time to prevent redundent toast notifications
    private checkedURLIsPollDetail: boolean;
    constructor(props: IMainListingPollProps) {
        super(props);
        this.contract = new this.props.web3Rpc.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.additionalData = [];
        this.initialMetadata = {};
        this.monitoringVotedPollLock = {};
        this.pollCardsSearchable = null;
        this.checkedURLIsPollDetail = false;
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
            filteredPolls: null,
            filteredView: "all",
            showDetailView: null,
        };
        this.syncAdditionalData = this.syncAdditionalData.bind(this);
        this.linkPoll = this.linkPoll.bind(this);
        this.selectedFilteredView = this.selectedFilteredView.bind(this);
        this.renderDetailView = this.renderDetailView.bind(this);
        this.detailViewToggleHandler = this.detailViewToggleHandler.bind(this);
        this.linkPollDetail = this.linkPollDetail.bind(this);
        bluebird.config(bluebirdConfig);

        // listening on route url changes related to poll details except for the first coming url
        this.props.history.listen((location, action) => {
            if (this.state.polls) {
                const pollDetailPaths = this.state.polls.map((poll) => {
                    return {
                        address: poll.address,
                        path: Routes.POLLS_BASE + poll.address,
                    };
                });
                let matched: boolean = false;
                for (const [index, {path, address}] of pollDetailPaths.entries()) {
                    if (location.pathname === path && (address !== this.props.activeDetailAddress.address) && this.state.polls) {
                        if (!matched) {
                            matched = true;
                        }
                        this.setState({
                            showDetailView: null,
                        });
                        this.props.setActiveDetailAddress(address, index);
                        this.props.setActiveDetailViewInProgress(true);
                        this.props.setLoadingHint(true);
                        break;
                    }
                }
                if (!matched) {
                    this.setState({
                        showDetailView: null,
                    });
                    this.props.setActiveDetailAddress(null);
                    this.props.setActiveDetailViewInProgress(false);
                    this.props.setLoadingHint(false);
                };
            }
        });
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
        if ((this.props !== prevProps) && (this.props.blockHeight !== prevProps.blockHeight)) {
            await this.refreshPolls();
        }

        // check the first coming url if matches detail poll's path or not
        if (this.state.polls && !this.checkedURLIsPollDetail) {
            const pollDetailPaths = this.state.polls.map((poll) => {
                return {
                    address: poll.address,
                    path: Routes.POLLS_BASE + poll.address,
                };
            });
            for (const [index, {address, path}] of pollDetailPaths.entries()) {
                if (this.props.location.pathname === path && (address !== this.props.activeDetailAddress.address) && this.state.polls) {
                    this.setState({
                        showDetailView: null,
                    });
                    this.props.setActiveDetailAddress(address, index);
                    this.props.setActiveDetailViewInProgress(true);
                    this.props.setLoadingHint(true);
                    break;
                }
            }

            this.checkedURLIsPollDetail = true;
        }
    }

    linkPollDetail(address: string) {
        this.props.history.push(Routes.POLLS_BASE + address);
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

            // iterate over poll list to find out monitoring polls asynchronously
            const notifiedCreatedVotings: AddressType[] = [];
            const pollAddresses = polls.map((poll) => poll.address);
            for (const poll of polls) {
                if (this.props.monitoring.created.includes(poll.address)) {
                    notifiedCreatedVotings.push(poll.address);

                    this.props.history.replace("/");

                    const title = "Poll Creation";
                    const detail = (<div>Your poll have just been published! <Icon size="small" name="external alternate" onClick={this.linkPoll.bind(this, poll.address)} /></div>);
                    toast(<Toast title={title} detail={detail} />,  {
                        autoClose: false,
                    });

                    if (!this.props.userWindowFocus && this.props.notificationStatus === true) {
                        const notification = new Notification(NOTIFICATION_TITLE, {
                            body: "Your poll have just been published!",
                        });
                    }
                }

                if (this.props.monitoring.voted.includes(poll.address) && this.props.accountAddress) {
                    if (!(poll.address in this.monitoringVotedPollLock)) {
                        this.monitoringVotedPollLock[poll.address] = true;
                        const atIndex = pollAddresses.indexOf(poll.address);
                        const contract = polls[atIndex].contract;
                        const isVoted = await contract.methods.isVoted(this.props.accountAddress).call() as boolean;

                        const detailContent = "Your vote has been submitted.";
                        if (!this.props.userWindowFocus && this.props.notificationStatus === true) {
                            const notification = new Notification(NOTIFICATION_TITLE, {
                                body: detailContent,
                            });
                        }

                        if (isVoted) {
                            const title = "Vote";
                            const detail = (<div>{detailContent} <Icon size="small" name="external alternate" onClick={this.linkPollDetail.bind(this, poll.address)} /></div>);
                            this.props.removeMonitoringVotedPoll(poll.address);
                            toast(<Toast title={title} detail={detail} />, {
                                autoClose: false,
                            });

                            this.props.removeVoteInProgress(poll.address);
                        }
                        delete this.monitoringVotedPollLock[poll.address];
                    }
                }
            }

            if (notifiedCreatedVotings.length !== 0) {
                this.props.removeMonitoringCreatedPolls(notifiedCreatedVotings);
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

    detailViewToggleHandler(args: PollDetailArguments | null) {
        if (args === null) {
            return this.setState({
                showDetailView: null,
            });
        }

        const { web3, web3Rpc, contract, address, title, options, expiryBlockHeight, isExpired, isVoted, votesAmount } = args;
        this.setState({
            showDetailView: {
                web3,
                web3Rpc,
                contract,
                address,
                title,
                options,
                expiryBlockHeight,
                isExpired,
                isVoted,
                votesAmount,
            },
        });
    }

    renderFiltered(pollsAll: PollInitialMetadata[], polls: PollInitialMetadata[], filter: AddressType[], listType: FilteredViewOptions) {
        const filteredAddresses = polls.filter((pollInitialMetadata) => filter.includes(pollInitialMetadata.address)).map((pollInitialMetadata2) => pollInitialMetadata2.address);

        if (filteredAddresses.length === 0) {
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
                pollsAll.map((pollInitialMetadata) => {
                    const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;

                    return <PollCard display={false} status={(isExpired) ? "inactive" : "active"} web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />;
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
            pollsAll.map((pollInitialMetadata) => {
                const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;

                return <PollCard display={filteredAddresses.includes(address) ? true : false} status={(isExpired) ? "inactive" : "active"} web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />;
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
                                                (this.state.filteredPolls !== null) ? this.renderFiltered(this.state.polls, this.state.polls, this.state.filteredPolls, "all") : (
                                                    this.state.polls.map((pollInitialMetadata) => {
                                                        const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;
                                                        return (
                                                            <PollCard display={true} status={(isExpired) ? "inactive" : "active"} web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
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
                                    (this.state.polls && this.state.activePolls) && (
                                        <div>
                                            {
                                                (this.state.filteredPolls !== null) ? this.renderFiltered(this.state.polls, this.state.activePolls, this.state.filteredPolls, "active") : (
                                                    this.state.polls.map((pollInitialMetadata) => {
                                                        let activePollAddresses: AddressType[] = [];
                                                        if (this.state.activePolls) {
                                                            activePollAddresses = this.state.activePolls.map((poll) => poll.address);
                                                        }

                                                        const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;
                                                        return (
                                                            <PollCard display={activePollAddresses.includes(pollInitialMetadata.address)} status="active" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
                                                        );
                                                    })
                                                )
                                            }
                                            {
                                                (this.showNoSearchResult.active) && this.renderNoMatchesAvailable()
                                            }
                                            {
                                                (this.state.activePolls.length === 0) && this.renderNoPollsAvailable()
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        );
                    case "inactive":
                        return (
                            <div className={style["poll-content"]}>
                                {
                                    (this.state.polls && this.state.inactivePolls) && (
                                        <div>
                                            {
                                                (this.state.filteredPolls !== null) ? this.renderFiltered(this.state.polls, this.state.inactivePolls, this.state.filteredPolls, "inactive") : (
                                                    this.state.polls.map((pollInitialMetadata) => {
                                                        let inactivePollAddresses: AddressType[] = [];
                                                        if (this.state.inactivePolls) {
                                                            inactivePollAddresses = this.state.inactivePolls.map((poll) => poll.address);
                                                        }

                                                        const { address, isExpired, expiryBlockNumber, contract } = pollInitialMetadata;
                                                        return (
                                                            <PollCard display={inactivePollAddresses.includes(pollInitialMetadata.address)} status="inactive" web3={this.props.web3} web3Rpc={this.props.web3Rpc} address={address} isExpired={isExpired} expiryBlockNumber={expiryBlockNumber} contract={contract} additionalDataConnecter={this.syncAdditionalData} key={address} />
                                                        );
                                                    })
                                                )
                                            }
                                            {
                                                (this.showNoSearchResult.inactive) && this.renderNoMatchesAvailable()
                                            }
                                            {
                                                (this.state.inactivePolls.length === 0) && this.renderNoPollsAvailable()
                                            }
                                        </div>
                                    )
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

    renderDetailView() {
        if (!this.state.showDetailView) {
            return;
        }

        const { web3, web3Rpc, contract, address, title, options, expiryBlockHeight, isExpired, isVoted, votesAmount } = this.state.showDetailView;
        return (
            <PollDetail
                web3={web3}
                web3Rpc={web3Rpc}
                address={address}
                title={title}
                options={options}
                votesAmount={votesAmount}
                expiryBlockHeight={expiryBlockHeight}
                isExpired={isExpired}
                isVoted={isVoted}
                contract={contract}
            />
        );
    }

    initialDetailView() {
        if (!this.props.activeDetailAddress.address) {
            return new Error("Can't invoke without activeDetailAddress");
        }

        if (!this.state.polls) {
            return;
        }

        return (
            <PollCard
                detailViewDataConnecter={this.detailViewToggleHandler}
                display={false}
                detailViewOnly={true}
                status="inactive"
                web3={this.props.web3}
                web3Rpc={this.props.web3Rpc}
                address={this.props.activeDetailAddress.address}
                isExpired={(this.state.polls && this.state.polls[this.props.activeDetailAddress.index as number].isExpired) as boolean}
                expiryBlockNumber={(this.state.polls && this.state.polls[this.props.activeDetailAddress.index as number].expiryBlockNumber) as number}
                contract={(this.state.polls && this.state.polls[this.props.activeDetailAddress.index as number].contract) as any}
                key={this.props.activeDetailAddress.address}
            />
        );
    }

    render() {
        return (
            <div>
                <Header size="huge">Latest polls</Header>
                {this.renderMenu()}
                {this.renderContent()}
                {this.props.activeDetailAddress.address && this.initialDetailView()}
                {this.props.activeDetailAddress.address && this.renderDetailView()}
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
        activeDetailAddress: {
            address: state.pollMisc.activeDetailAddress.address,
            index: state.pollMisc.activeDetailAddress.index,
        },
        accountAddress: state.ethMisc.accountAddress,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<PollActionType | UserActionType>, ownProps: IMainListingPoll.IInnerProps): IMainListingPoll.IPropsFromDispatch => {
    return {
        setPollStatistics: (amount: number, active: number) => dispatch(setStatistics(amount, active)),
        removeMonitoringCreatedPolls: (addresses: AddressType[]) => dispatch(removeMonitoringCreatedPoll(addresses)),
        removeMonitoringVotedPoll: (address: AddressType) => dispatch(removeMonitoringVotedPoll([address])),
        setSearchResultsAmount: (amount: number | null) => dispatch(setSearchResultsAmount(amount)),
        setSearchBar: (enabled: boolean) => dispatch(setSearchBar(enabled)),
        setActiveDetailAddress: (address: AddressType | null, index?: number) => dispatch(setActivePollDetail(address, index)),
        setActiveDetailViewInProgress: (inProgress: boolean) => dispatch(setActivePollDetailInProgress(inProgress)),
        removeVoteInProgress: (address: AddressType) => dispatch(removeVoteInProgress(address)),
        setLoadingHint: (show: boolean) => dispatch(setLoadingHint(show)),
    };
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainListingPoll));
