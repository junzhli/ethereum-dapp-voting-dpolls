import React, { Dispatch } from 'react';
import { IMembershipUpgradePromotionProps, IMembershipUpgradePromotionStates } from './types/MembershipUpgradePromotion';
import { Item, Icon, Header } from 'semantic-ui-react';
import style from './MembershipUpgradePromotion.module.css';

class MembershipUpgradePromotion extends React.Component<IMembershipUpgradePromotionProps, IMembershipUpgradePromotionStates> {
    render() {
        return (
            <Item.Group>
                <div className={style.center}>
                    <Icon name='info circle' size='massive' />
                    <Header>
                        Membership only.
                    </Header>
                </div>
            </Item.Group>
        )
    }
}

export default MembershipUpgradePromotion;
