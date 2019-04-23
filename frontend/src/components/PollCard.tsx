import React from 'react';
import { IPollCardProps, IPollCardStates } from './types/PollCard';

class PollCard extends React.Component<IPollCardProps, IPollCardStates> {
    constructor(props: IPollCardProps) {
        super(props);

        this.state = {
            isExpired: null
        }
    }

    componentDidMount() {
        if (this.props.web3 === null) {
            console.log('Unable to load poll card: ' + this.props.address);
        }

        
    }

    renderComponment() {

    }

    render() {
        return (
            <div id={ this.props.address }>
                Loading ...
            </div>
        )
    }
}

export default PollCard;