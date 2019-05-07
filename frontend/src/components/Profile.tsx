import React from 'react';
import { IProfileProps, IProfileStates, IProfile } from './types/Profile';
import { Card, Icon, Image } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { StoreState } from '../store/types';

class Profile extends React.Component<IProfileProps, IProfileStates> {
    constructor (props: IProfileProps) {
        super(props);

    }

    render () {
        return (
            <Card>
                {/* <Image src='https://react.semantic-ui.com/images/avatar/large/daniel.jpg' wrapped ui={false} /> */}
                <Card.Content>
                <Card.Header>InfoCard</Card.Header>
                {/* <Card.Meta>Joined in 2016</Card.Meta> */}
                <Card.Description>
                    Daniel is a comedian living in Nashville.
                </Card.Description>
                <Card.Description>
                    Daniel is a comedian living in Nashville.
                </Card.Description>
                <Card.Description>
                    Daniel is a comedian living in Nashville.
                </Card.Description>
                </Card.Content>
                <Card.Content extra>
                <a>
                    <Icon name='user' />
                    10 Friends
                </a>
                </Card.Content>
            </Card>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IProfile.IInnerProps): IProfile.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress
    }
}

export default connect(
    mapStateToProps,
    null
)(Profile);
