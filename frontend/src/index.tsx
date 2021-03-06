import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "semantic-ui-css/semantic.min.css";
import "react-toastify/dist/ReactToastify.css";
import { Dimmer, Loader, Button, Icon } from "semantic-ui-react";
import Web3 from "web3";
import commonStyle from "./commons/styles/index.module.css";
import MainBanner from "./components/MainBanner";
import MainListingPoll from "./components/MainListingPoll";
import Profile from "./components/Profile";
import style from "./index.module.css";
import store from "./store";
import { IIndexStates } from "./types";
import { NETWORK_NAME } from "./constants/networkID";
import { BrowserRouter as Router } from "react-router-dom";
import ReactGA from "react-ga";
import MainFooter from "./components/MainFooter";
import MainSearchBar from "./components/MainSearchBar";
import { toast } from "react-toastify";
import toastConfig from "./commons/toastConfig";
import { animateScroll as scroll } from "react-scroll";

const GOOGLE_ANALYTICS_TRACKING_ID = process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKING_CODE;
if (GOOGLE_ANALYTICS_TRACKING_ID) {
    ReactGA.initialize(GOOGLE_ANALYTICS_TRACKING_ID);
}

const NETWORK_ID = process.env.REACT_APP_NETWORK_ID;
const WEB3_PROVIDER = process.env.REACT_APP_WEB3_PROVIDER as string;

/**
 * global declaration
 */
declare global {
    interface Window {
        web3: any;
        ethereum: any;
    }
}

class App extends React.Component<{}, IIndexStates> {
    private networkName: string | null;
    constructor(props: {}) {
        super(props);
        let web3 = null;
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof window.web3 !== "undefined") {
            web3 = new Web3(window.web3.currentProvider);
        }

        const approved = (web3 !== null) ? false : null;
        const networkChecked = (web3 !== null) ? false : null;
        const showUserPrivacyModeDeniedMessage = (web3 !== null) ? false : null;
        const showUserWalletLockedMessage = (web3 !== null) ? false : null;

        // Used for any JSON-RPC except user's operations
        const web3Rpc = new Web3(WEB3_PROVIDER);

        this.state = {
            web3,
            web3Rpc,
            networkChecked,
            approved,
            showUserPrivacyModeDeniedMessage,
            showUserWalletLockedMessage,
            voting: {
                selector: null,
            },
            showScrollToButton: false,
        };
        this.networkName = null;
        this.userWalletUnlockApproval = this.userWalletUnlockApproval.bind(this);
        this.scrollToTop = this.scrollToTop.bind(this);
        this.showScrollToTopButton = this.showScrollToTopButton.bind(this);
        toast.configure(toastConfig);
    }

    async componentDidMount() {
        if (GOOGLE_ANALYTICS_TRACKING_ID) {
            ReactGA.pageview("/");
        }

        if (this.state.web3) {
            if (typeof NETWORK_ID !== "undefined") {
                const networkId: string = (await this.state.web3.eth.net.getId() as number).toString();
                if (NETWORK_ID === networkId) {
                    this.setState({
                        networkChecked: true,
                    });
                } else {
                    if (NETWORK_ID in NETWORK_NAME) {
                        this.networkName = NETWORK_NAME[NETWORK_ID];
                        this.forceUpdate();
                    }
                }
            } else {
                this.setState({
                    networkChecked: true,
                });
            }

            if ((await this.state.web3.eth.getAccounts()).length === 0) {
                await this.userWalletUnlockApproval();
            } else {
                this.setState({
                    approved: true,
                });
            }
        }

        window.addEventListener("scroll", this.showScrollToTopButton);
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.showScrollToTopButton);
    }

    showScrollToTopButton() {
        const { showScrollToButton } = this.state;
        if (window.pageYOffset > 350 && !showScrollToButton) {
            this.setState({
                showScrollToButton: true,
            });
        }

        if (window.pageYOffset <= 350 && showScrollToButton) {
            this.setState({
                showScrollToButton: false,
            });
        }
    }

    scrollToTop() {
        scroll.scrollToTop();
    }

    async userWalletUnlockApproval() {
        if (typeof window.ethereum !== "undefined") {
            try {
                const value = await window.ethereum.enable();
                if (value) {
                    this.setState({
                        approved: true,
                        showUserPrivacyModeDeniedMessage: false,
                    });
                } else {
                    return this.setState({
                        approved: false,
                        showUserPrivacyModeDeniedMessage: true,
                    });
                }
            } catch (error) {
                console.log("user rejected the approval");
                console.log(error);

                if (error.code === 4001) { // User denied account authorization
                    return this.setState({
                        approved: false,
                        showUserPrivacyModeDeniedMessage: true,
                    });
                }
            }
        }

        const accounts = await this.state.web3.eth.getAccounts();
        if (accounts.length === 0) {
            return this.setState({
                approved: false,
                showUserWalletLockedMessage: true,
            });
        }

        this.setState({
            approved: true,
            showUserPrivacyModeDeniedMessage: false,
            showUserWalletLockedMessage: false,
        });
    }

    renderComponent() {
        if (this.state.networkChecked === false) {
            return (
                <div className={style["info-segment"]}>
                    <Dimmer active={true}>
                        <Loader size="massive">We are only available on {
                                (this.networkName) ? (
                                    this.networkName
                                ) : (
                                    "unknown network (Network ID: " + NETWORK_ID + ")"
                                )
                            }.<br/>Please change the network type where the Metamask connects to!
                        </Loader>
                    </Dimmer>
                </div>
            );
        } else if (this.state.approved === false) {
            if (this.state.showUserPrivacyModeDeniedMessage) {
                return (
                    <div className={style["info-segment"]}>
                        <Dimmer active={true}>
                            <Loader size="massive">Please approve privacy data gathering, and reload the page</Loader>
                        </Dimmer>
                    </div>
                );
            }
            if (this.state.showUserWalletLockedMessage) {
                return (
                    <div className={style["info-segment"]}>
                        <Dimmer active={true}>
                            <Loader size="massive">Please unlock wallet at first, and reload the page</Loader>
                        </Dimmer>
                    </div>
                );
            } else {
                return (
                    <div className={style["info-segment"]}>
                            <Dimmer active={true}>
                                <Loader size="massive">Preparing for all required user information: trying to access user's wallet</Loader>
                            </Dimmer>
                    </div>
                );
            }
        } else {
            return (
                <Router>
                    <div>
                        <div className={style.bg} />
                        <MainBanner web3={this.state.web3} web3Rpc={this.state.web3Rpc} userWalletUnlockApproval={this.userWalletUnlockApproval} />

                        <div className={style["content-wrap"]}>
                            <div className={style.listing}>
                                <div className={style["listing-inner"]}>
                                    <MainListingPoll web3={this.state.web3} web3Rpc={this.state.web3Rpc} />
                                </div>
                            </div>
                            <div className={style.infobar}>
                                <div className={style["infobar-inner"]}>
                                    <MainSearchBar />
                                    <Profile web3={this.state.web3} />
                                </div>
                            </div>
                        </div>
                        <div className={(this.state.showScrollToButton) ? style["scroll-to-top"] : [style["scroll-to-top"], commonStyle.hidden].join(" ")}>
                            <Button color="black" icon={true} onClick={this.scrollToTop}>
                                <Icon name="chevron up" size="big" />
                            </Button>
                        </div>
                        <div className={style.footer}>
                            <MainFooter />
                        </div>
                    </div>
                </Router>
            );
        }
    }

    render() {
        return this.renderComponent();
    }
}

const rootElement = document.getElementById("root");

ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    rootElement,
);
