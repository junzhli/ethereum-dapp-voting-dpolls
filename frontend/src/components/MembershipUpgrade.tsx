import React, { Dispatch } from 'react';
import { IMembershipUpgradeProps, IMembershipUpgradeStates, IMembershipUpgrade } from './types/MembershipCard';
import { Modal, Button, Header, Image, Segment, Grid, Form, Divider, Label, Dimmer, Message, Icon, Menu } from 'semantic-ui-react';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';
import citizenImage from '../commons/statics/images/citizen.png';
import diamondImage from '../commons/statics/images/diamond.png';
import style from './MembershipUpgrade.module.css';
import { ETHActionType } from '../actions/types/eth';
import { Membership } from '../types';
import { setMembership } from '../actions/eth';

class MembershipUpgrade extends React.Component<IMembershipUpgradeProps, IMembershipUpgradeStates> {
    constructor(props: IMembershipUpgradeProps) {
        super(props);
    }

    render() {
        return (
            <Modal trigger={<Menu.Item
                name='Upgrade'
                active={false}
            />}>
                <Modal.Header>Select a plan</Modal.Header>
                <Modal.Content>
                    {
                        (this.props.membership === null) && (
                            <Message icon className={style['message-top']}>
                                <Icon name='circle notched' loading />
                                <Message.Content>
                                <Message.Header>Just a few seconds</Message.Header>
                                Still processing your membership status
                                </Message.Content>
                            </Message>
                        )
                    }
                    
                    <Segment placeholder>
                        <Grid columns={2} padded='vertically' stackable>
                        <Grid.Column>
                            <Segment raised>
                                <div className={style['plan-square']}>
                                    <div className={[style['plan-name'], style['inline-component'], style['plan-citizen-title'], style['title-center']].join(' ')}>
                                            <h3>Citizen</h3>
                                    </div>
                                    <div className={style['price']}>
                                        1 ETH
                                    </div>
                                    <div className={style.center}>
                                        <Image src={citizenImage} verticalAlign='middle' />
                                    </div>
                                    <Button content='Upgrade now' primary disabled={this.props.membership !== Membership.NO_BODY} />
                                    {
                                        (this.props.membership === Membership.CITIZEN) && (
                                            <div className={style['note-below']}>(Already)</div>
                                        )
                                    }
                                    
                                </div>
                            </Segment>
                            
                        </Grid.Column>

                        <Grid.Column>
                            <Segment raised>
                                <div className={style['plan-square']}>
                                    <div className={style['inline-container']}>
                                        <Label as='a' color='red' ribbon className={style['inline-component']}>
                                            Most popular
                                        </Label>
                                        <div className={[style['plan-name'], style['inline-component'], style['plan-diamond-title'], style['title-center']].join(' ')}>
                                            <h3>Diamond</h3>
                                        </div>
                                        {/* <Header className={[style['plan-name'], style['inline-component']].join(' ')}>
                                            Diamond
                                        </Header> */}
                                    </div>
                                    
                                    <div className={style['price']}>
                                        10 ETH
                                    </div>
                                    
                                    <div className={style.center}>
                                        <Image src={diamondImage} verticalAlign='middle' />
                                    </div>
                                    <Button content='Upgrade now' primary disabled={(this.props.membership !== Membership.CITIZEN) && (this.props.membership !== Membership.NO_BODY)} />
                                    {
                                        (this.props.membership === Membership.DIAMOND) && (
                                            <div className={style['note-below']}>(Already)</div>
                                        )
                                    }
                                </div>
                            </Segment>
                        </Grid.Column>
                        </Grid>
                    </Segment>
                </Modal.Content>
            </Modal>
        );
    }
}

const mapStateToProps = (state: StoreState, ownProps: IMembershipUpgrade.IInnerProps): IMembershipUpgrade.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight,
        membership: state.ethMisc.membership
    }
}

const mapDispatchToProps = (dispatch: Dispatch<ETHActionType>, ownProps: IMembershipUpgrade.IInnerProps): IMembershipUpgrade.IPropsFromDispatch => {
    return {
        setMembership: (nextMembership: Membership) => dispatch(setMembership(nextMembership))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MembershipUpgrade);
