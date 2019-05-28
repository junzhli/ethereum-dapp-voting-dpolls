import React, { Dispatch } from "react";
import { Input, InputOnChangeData, Header } from "semantic-ui-react";
import { IMainSearchBarProps, IMainSearchBarStates, IMainSearchBar } from "./types/MainSearchBar";
import { PollActionType } from "../actions/types/poll";
import { setUserSearchKeywords } from "../actions/poll";
import { connect } from "react-redux";
import { StoreState } from "../store/types";
import style from "./MainSearchBar.module.css";

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
            <div>
                <div className={this.props.searchResultsAmount === null ? style["matches-text-hidden"] : undefined}>
                    <Header size="tiny" color="red">({this.props.searchResultsAmount} matches found)</Header>
                </div>
                <Input disabled={!this.props.searchBarEnabled} onChange={this.userInputOnChange} fluid={true} size="large" icon="search" placeholder="Search polls..." />
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, ownProps: IMainSearchBar.IInnerProps): IMainSearchBar.IStateFromProps => {
    return {
        searchResultsAmount: state.pollMisc.searchResultsAmount,
        searchBarEnabled: state.userMisc.searchbarEnabled,
    };
};

const mapDispatchToProps = (dispatch: Dispatch<PollActionType>, ownProps: IMainSearchBar.IInnerProps): IMainSearchBar.IPropsFromDispatch => {
    return {
        setUserSearchKeywords: (keywords: string | null) => dispatch(setUserSearchKeywords(keywords)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainSearchBar);
