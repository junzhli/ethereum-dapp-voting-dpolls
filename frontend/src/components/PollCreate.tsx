import React from 'react';
import { Modal, Button, Image, Header, Menu, Form, Checkbox, Icon } from 'semantic-ui-react';
import { IPollCreate, IPollCreateProps, IPollCreateStates } from './types/PollCreate';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';
import style from './PollCreate.module.css';
import { VOTING_CORE_ABI } from '../constants/contractABIs';

const VOTING_CORE_ADDRESS = process.env.REACT_APP_VOTING_CORE_ADDRESS;
class PollCreate extends React.Component<IPollCreateProps, IPollCreateStates> {
    private contract: any;
    constructor(props: IPollCreateProps) {
        super(props);
        this.contract = new this.props.web3.eth.Contract(VOTING_CORE_ABI, VOTING_CORE_ADDRESS);
        this.state = {
            optionsAmount: 1
        }
    }

    addOption() {
        this.setState({
            optionsAmount: this.state.optionsAmount + 1
        })
    }

    createPoll() {

    }

    render() {
        return (
            <Modal trigger={
                <Menu.Item
                    name='Create'
                    active={false}
                />
            }>
                <Modal.Header>Create a poll</Modal.Header>
                <Modal.Content>
                    <Form className={style['form-ui']} size='large'>
                        <Form.Field>
                            <label>Title</label>
                            <input placeholder='Title' />
                        </Form.Field>
                        <Form.Field>
                            <label>Host</label>
                            <input placeholder={(this.props.accountAddress) ? this.props.accountAddress : 'Host'} disabled/>
                        </Form.Field>
                        <Form.Field>
                            <label>Options</label>
                            <div className={style['options-wrapper']}>
                                <div className={style['option-outer']}>
                                    <input placeholder='Option 0' /> 
                                    {
                                        Array.from(Array(this.state.optionsAmount), (entity, index) => {
                                            if (index !== 0) {
                                                return (
                                                    <div className={style['option-divider']}>
                                                        <input placeholder={'Option ' + (index)} />
                                                    </div>
                                                )
                                            }
                                        })
                                    }
                                </div>
                                
                                <div className={style['button-outer']}>
                                    <Button circular icon='plus' onClick={() => this.addOption()} />
                                </div>
                            </div>
                            
                        </Form.Field>
                        <Form.Field>
                            <Checkbox label='I agree to the Terms and Conditions' />
                        </Form.Field>
                        <Button type='submit'>Submit</Button>
                    </Form>
                    {/* <Image wrapped size='medium' src='https://react.semantic-ui.com/images/avatar/large/rachel.png' />
                    <Modal.Description>
                        <Header>Default Profile Image</Header>
                        <p>We've found the following gravatar image associated with your e-mail address.</p>
                        <p>Is it okay to use this photo?</p>
                    </Modal.Description> */}
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IPollCreate.IInnerProps): IPollCreate.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight
    }
}

export default connect(
    mapStateToProps,
    null
)(PollCreate);
