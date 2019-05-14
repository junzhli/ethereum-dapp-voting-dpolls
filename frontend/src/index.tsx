import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import { Provider } from 'react-redux';
import store from './store';
import { IIndexStates } from './types';
import MainBanner from './components/MainBanner';
import MainListingPoll from './components/MainListingPoll';
import 'semantic-ui-css/semantic.min.css';
import commonStyle from './commons/styles/index.module.css';
import style from './index.module.css';
import Profile from './components/Profile';
import { Loader, Dimmer } from 'semantic-ui-react';

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
    constructor (props: {}) {
        super(props);
        let web3 = null;
        let approved = false;
        let showUserPrivacyModeDeniedMessage = false;
        let showUserWalletLockedMessage = false;

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof window.web3 !== 'undefined') {
            web3 = new Web3(window.web3.currentProvider);
        } else {
            console.log('No web3? You should consider trying MetaMask!');
        }

        this.state = {
            web3,
            approved,
            showUserPrivacyModeDeniedMessage,
            showUserWalletLockedMessage,
            voting: {
                selector: null
            }
        };
    }

    async userWalletUnlockApproval() {
        this.setState({
            approved: false
        })

        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.enable();
                this.setState({
                    approved: true
                })
            } catch (error) {
                console.log('user rejected the approval')
                console.log(error);
    
                if (error.code === 4001) { // User denied account authorization
                    console.log('code 4001');
                    this.setState({
                        showUserPrivacyModeDeniedMessage: true
                    })
                }
            }
        } else {
            this.setState({
                showUserWalletLockedMessage: true
            })
        }
    }

    async componentDidMount() {
        if (this.state.web3) {
            if ((await this.state.web3.eth.getAccounts()).length === 0) {
                await this.userWalletUnlockApproval();
            } else {
                this.setState({
                    approved: true
                })
            }
        }
    }

    renderComponent() {
        if (this.state.web3 === null) {
            return (
                <div>
                    Please install Metamask/Mist at first!
                </div>
            )
        } else if (!this.state.approved) {
            if (this.state.showUserPrivacyModeDeniedMessage) {
                return (
                    <div className={style['info-segment']}>
                            <Dimmer active>
                                <Loader size='massive'>Please approve privacy data gathering, and reload the page</Loader>
                            </Dimmer>
                    </div>
                )
            } if (this.state.showUserWalletLockedMessage) {
                return (
                    <div className={style['info-segment']}>
                            <Dimmer active>
                                <Loader size='massive'>Please unlock wallet at first, and reload the page</Loader>
                            </Dimmer>
                    </div>
                )
            } else {
                return (
                    <div className={style['info-segment']}>
                            <Dimmer active>
                                <Loader size='massive'>Preparing for all required user information</Loader>
                            </Dimmer>
                    </div>
                )
            }
        } else {
            return (
                <div>
                    <div>
                        <MainBanner web3={this.state.web3} userWalletUnlockApproval={() => this.userWalletUnlockApproval()} />
                    </div>
                    
                    <div className={style['content-part']}>
                        <div className={[commonStyle.border, style['listing-outer']].join(' ')}>
                            <div className={style['listing-inner']}>
                                <div className={style['listing-inner-content']}>
                                    <MainListingPoll web3={this.state.web3} />
                                </div>
                            </div>
                        </div>
                        <div className={style['profile']}>
                            <Profile web3={this.state.web3} />
                        </div>
                    </div>
                </div>
            )
        }
    }

    render () {
        return this.renderComponent();
    }
}

const rootElement = document.getElementById('root');

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    rootElement
)
