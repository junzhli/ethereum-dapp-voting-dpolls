import React from 'react';
import { Modal, Button, Header, Image } from 'semantic-ui-react';
import { IPollDetailProps, IPollDetailStates, IInnerProps, IStateFromProps } from './types/PollDetail';
import { sendTransaction } from '../utils/web3';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';

class PollDetail extends React.Component<IPollDetailProps, IPollDetailStates> {
    constructor(props: IPollDetailProps) {
        super(props);
    }

    vote(option: number) {
        const web3 = this.props.web3;
        const from = this.props.accountAddress as string;
        const to = this.props.address;
        const data = this.props.contract.methods.vote(option).encodeABI();
        sendTransaction(
            web3,
            from,
            to,
            data
        )
    }

    render() {
        return (
            <div>
                <Modal trigger={<button>Detail</button>}>
                    <Modal.Header>Poll detail</Modal.Header>
                    <Modal.Content image>
                        {/* <Image
                            wrapped
                            size="medium"
                            src="https://react.semantic-ui.com/images/avatar/large/rachel.png"
                        /> */}
                        <Modal.Description>
                            <Header>{this.props.title}</Header>
                            <div>
                                Expiry Block Height: {this.props.expiryBlockHeight}
                            </div>
                            {
                                this.props.options.map((option, index) => {
                                    return (
                                        <div key={option}>
                                            <div>
                                                {index}: {option}
                                            </div>
                                            {
                                                !this.props.isVoted && (
                                                    <div>
                                                        <button onClick={() => this.vote(index)}>Vote</button>
                                                    </div>
                                                )
                                            }
                                            
                                        </div>
                                    )
                                })
                            }
                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IInnerProps): IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress
    }
}

export default connect(
    mapStateToProps,
    null
)(PollDetail);

