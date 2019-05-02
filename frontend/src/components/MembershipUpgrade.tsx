import React from 'react';
import { IMembershipUpgradeProps, IMembershipUpgradeStates, IMembershipUpgrade } from './types/MembershipCard';
import { Modal, Button, Header, Image, Segment, Grid, Form, Divider } from 'semantic-ui-react';
import { StoreState } from '../store/types';
import { connect } from 'react-redux';

class MembershipUpgrade extends React.Component<IMembershipUpgradeProps, IMembershipUpgradeStates> {
    render() {
        return (
            <Modal trigger={<Button>Upgrade</Button>}>
                <Modal.Header>Select a plan</Modal.Header>
                <Modal.Content>
                    <Segment placeholder>
                        <Grid columns={2} relaxed='very' stackable>
                        <Grid.Column>
                            <Header>
                                Citizen
                            </Header>
                            <Button content='1 ETH' primary />
                        </Grid.Column>

                        <Grid.Column verticalAlign='middle'>
                            <Header>
                                Diamond
                            </Header>
                            <Button content='10 ETH' primary />
                        </Grid.Column>
                        </Grid>

                        <Divider vertical />
                    </Segment>
                </Modal.Content>
            </Modal>
        )
    }
}

const mapStateToProps = (state: StoreState, ownProps: IMembershipUpgrade.IInnerProps): IMembershipUpgrade.IStateFromProps => {
    return {
        accountAddress: state.ethMisc.accountAddress,
        blockHeight: state.ethMisc.blockHeight
    }
}

export default connect(
    mapStateToProps,
    null
)(MembershipUpgrade);
