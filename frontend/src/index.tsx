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

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof window.web3 !== 'undefined') {
            web3 = new Web3(window.web3.currentProvider);
        } else {
            console.log('No web3? You should consider trying MetaMask!');
        }

        this.state = {
            web3,
            approved,
            voting: {
                selector: null
            }
        };
    }

    componentDidMount() {
        
    }

    renderComponent() {
        if (this.state.web3 === null) {
            return (
                <div>
                    Please install Metamask/Mist at first!
                </div>
            )
        } else {
            return (
                <div>
                    <div>
                        <MainBanner web3={this.state.web3} />
                    </div>
                    
                    <div className={style['content-part']}>
                        <div className={[commonStyle.border, style['listing-outer']].join(' ')}>
                            <div className={style['listing-inner']}>
                                <MainListingPoll web3={this.state.web3} />
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
