import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import { Provider } from 'react-redux';
import store from './store';
import { IIndexStates } from './types';
import MainBanner from './components/MainBanner';
import MainListingPoll from './components/MainListingPoll';
import 'semantic-ui-css/semantic.min.css';
import { Container, Divider } from 'semantic-ui-react';

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
                    {   
                        <Container>
                            <MainBanner web3={this.state.web3} />
                        </Container>
                    }
                    {
                        <Divider clearing></Divider>
                    }
                    {
                        <Container>
                            <MainListingPoll web3={this.state.web3} />
                        </Container>
                    }
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
