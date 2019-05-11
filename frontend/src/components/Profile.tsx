import React from 'react';
import { IProfileProps, IProfileStates, IProfile } from './types/Profile';
import { Card, Icon, Image, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { StoreState } from '../store/types';
import style from './Profile.module.css';
import { Membership } from '../types';

class Profile extends React.Component<IProfileProps, IProfileStates> {
    constructor (props: IProfileProps) {
        super(props);
    }

    getMembership() {
        switch (this.props.membership) {
            case Membership.NO_BODY:
                return (
                    <div className={[style['rcorner'], style['free']].join(' ')} >
                        FREE
                    </div>
                );
            case Membership.CITIZEN:
                return (
                    <div className={[style['rcorner'], style['citizen']].join(' ')} >
                        CITIZEN
                    </div>
                );
            case Membership.DIAMOND:
            return (
                    <div className={[style['rcorner'], style['diamond']].join(' ')} >
                        DIAMOND
                    </div>
                );
            default:
                return null;
        }
    }

    render () {
        return (
            <Card>
                {/* <Image src='https://react.semantic-ui.com/images/avatar/large/daniel.jpg' wrapped ui={false} /> */}
                <Card.Content>
                    <Card.Header><Icon color='black' name='clock outline' />Latest block</Card.Header>
                    <Card.Description>
                        <div>
                             {
                                 this.props.blockHeight !== -1 ? (
                                     this.props.blockHeight + ' blocks'
                                 ) : (
                                    <Loader active inline='centered' />
                                 )
                             }
                        </div>
                    </Card.Description>
                </Card.Content>
                <Card.Content>
                    <Card.Header><Icon color='red' name='user outline' />Current User</Card.Header>
                    <div className={style['address']}>
                        {
                            this.props.accountAddress ? (
                                this.props.accountAddress
                            ) : (
                                <Loader active inline='centered' />
                            )
                        }
                    </div>
                </Card.Content>
                <Card.Content>
                    <Card.Header><Icon color='grey' name='id badge' />Membership</Card.Header>
                    {
                        this.getMembership() !== null ? (
                            this.getMembership()
                        ) : (
                            <Loader active inline='centered' />
                        )
                    }
                </Card.Content>
            </Card>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IProfile.IInnerProps): IProfile.IStateFromProps => {
    return {
        blockHeight: state.ethMisc.blockHeight,
        accountAddress: state.ethMisc.accountAddress,
        membership: state.ethMisc.membership
    }
}

export default connect(
    mapStateToProps,
    null
)(Profile);
