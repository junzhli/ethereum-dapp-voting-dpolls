import React from "react";
import { Header, Icon, Item } from "semantic-ui-react";
import style from "./MembershipUpgradePromotion.module.css";
import { IMembershipUpgradePromotionProps, IMembershipUpgradePromotionStates } from "./types/MembershipUpgradePromotion";

class MembershipUpgradePromotion extends React.Component<IMembershipUpgradePromotionProps, IMembershipUpgradePromotionStates> {
    render() {
        return (
            <Item.Group>
                <div className={style.center}>
                    <Icon name="info circle" size="massive" />
                    <Header>
                        Members only.
                    </Header>
                </div>
            </Item.Group>
        );
    }
}

export default MembershipUpgradePromotion;
