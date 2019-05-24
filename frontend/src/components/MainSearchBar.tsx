import React, { Dispatch } from "react";
import { Input, InputOnChangeData } from "semantic-ui-react";
import { IMainSearchBarProps, IMainSearchBarStates, IMainSearchBar } from "./types/MainSearchBar";
import { PollActionType } from "../actions/types/poll";
import { setUserSearchKeywords } from "../actions/poll";
import { connect } from "react-redux";

class MainSearchBar extends React.Component<IMainSearchBarProps, IMainSearchBarStates> {
    constructor(props: IMainSearchBarProps) {
        super(props);
        this.userInputOnChange = this.userInputOnChange.bind(this);
    }

    userInputOnChange(event: React.ChangeEvent<HTMLInputElement>, data: InputOnChangeData) {
        const userInput = data.value;
        if (userInput.length === 0) {
            this.props.setUserSearchKeywords(null);
        } else {
            this.props.setUserSearchKeywords(userInput);
        }
    }

    render() {
        return(
            <Input onChange={this.userInputOnChange} fluid={true} size="large" icon="search" placeholder="Search polls..." />
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch<PollActionType>, ownProps: IMainSearchBar.IInnerProps): IMainSearchBar.IPropsFromDispatch => {
    return {
        setUserSearchKeywords: (keywords: string | null) => dispatch(setUserSearchKeywords(keywords)),
    };
};

export default connect(
    null,
    mapDispatchToProps,
)(MainSearchBar);
