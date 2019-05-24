import React, { Dispatch } from "react";
import { connect } from "react-redux";
import { Header, Icon, Menu } from "semantic-ui-react";
import { setAccountAddress, setBlockHeight, setMembership } from "../actions/eth";
import { AddressType, BlockHeightType, ETHActionType } from "../actions/types/eth";
import { VOTING_CORE_ABI } from "../constants/contractABIs";
import { StoreState } from "../store/types";
import { Membership } from "../types";
import style from "./MainBanner.module.css";
import MembershipUpgrade from "./MembershipUpgrade";
import PollCreate from "./PollCreate";
import { IMainBanner, IMainBannerProps, IMainBannerStates } from "./types/MainBanner";
import { withRouter } from "react-router-dom";
import { setNotificationStatus } from "../actions/user";
import { UserActionType } from "../actions/types/user";
import { NOTIFICATION_TITLE } from "../constants/project";

const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS;
class MainBanner extends React.Component<IMainBannerProps, IMainBannerStates> {
    private contract: any;
    private checkBlockNumberInterval: any;
    private checkAccountAddressInterval: any;

    constructor(props: IMainBannerProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.checkBlockNumberInterval = null;
        this.checkAccountAddressInterval = null;
        this.state = {
            isLoaded: false,
        };
    }

    async componentDidMount() {
        this.initialDesktopNotification();

        this.checkBlockNumberInterval = setInterval(async () => {
            const blockNumber = await this.props.web3.eth.getBlockNumber();
            if (blockNumber !== this.props.blockHeight) {
                this.props.setBlockHeight(blockNumber);
            }
        }, 1000);

        this.checkAccountAddressInterval = setInterval(async () => {
            const accountAddress = await this.props.web3.eth.getAccounts();

            if (accountAddress.length === 0) {
                this.props.userWalletUnlockApproval();
                return;
            }

            if (accountAddress[0] !== this.props.accountAddress) {
                this.props.setAccountAddress(accountAddress[0]);
                try {
                    const membership = (await this.contract.methods.getMembership(accountAddress[0]).call()).toNumber();
                    this.props.setMembership(membership);
                } catch (error) {
                    console.log("getMembership failed");
                    console.log(error);
                }
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.checkAccountAddressInterval);
        clearInterval(this.checkBlockNumberInterval);
    }

    initialDesktopNotification() {
        if ("Notification" in window) {
            switch (Notification.permission) {
                case "denied":
                    this.props.setNotificationStatus(false);
                    break;
                case "granted":
                    this.props.setNotificationStatus(true);
                    break;
                case "default":
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            const notification = new Notification(NOTIFICATION_TITLE, {
                                body: "Welcome! You'll be notified of any important message here :)",
                            });
                            this.props.setNotificationStatus(true);
                        }
                    }).catch(error => {
                        console.log("requestNotificationApproval failed");
                        console.log(error);
                    });
                    break;
            }
        }
    }

    showMembership() {
        switch (this.props.membership) {
            case Membership.NO_BODY:
                return "FREE";
            case Membership.CITIZEN:
                return "CITIZEN";
            case Membership.DIAMOND:
                return "DIAMOND";
        }
    }

    render() {
        return (
            <div className={style["main-banner"]}>
                <div className={[style.banner, style.center].join(" ")}>
                    <div className={style.logo}>
                        <Header inverted={true} as="h2">
                            <Icon name="archive" />
                            <Header.Content>dPolls</Header.Content>
                        </Header>
                    </div>
                    <div className={style.menu}>
                        <Menu secondary={true} inverted={true}>
                            <PollCreate web3={this.props.web3} />
                            {
                                (this.props.membership === Membership.NO_BODY) && (
                                    <MembershipUpgrade web3={this.props.web3} />
                                )
                            }
                        </Menu>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, ownProps: IMainBanner.IInnerProps): IMainBanner.IStateFromProps => {
    return {
        blockHeight: state.ethMisc.blockHeight,
        accountAddress: state.ethMisc.accountAddress,
        membership: state.ethMisc.membership,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<ETHActionType | UserActionType>, ownProps: IMainBanner.IInnerProps): IMainBanner.IPropsFromDispatch => {
    return {
        setBlockHeight: (blockHeight: BlockHeightType) => dispatch(setBlockHeight(blockHeight)),
        setAccountAddress: (accountAddress: AddressType) => dispatch(setAccountAddress(accountAddress)),
        setMembership: (nextMembership: Membership) => dispatch(setMembership(nextMembership)),
        setNotificationStatus: (status: boolean) => dispatch(setNotificationStatus(status)),
    };
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainBanner));
