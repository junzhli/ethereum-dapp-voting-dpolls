import { Icon } from "semantic-ui-react";
import commonStyle from "../commons/styles/index.module.css";
import React from "react";
import { IToastProps, IToastStates } from "./types/Toast";

class Toast extends React.Component<IToastProps, IToastStates> {
    render() {
        return (
            <div>
                <div>
                    <Icon name="bell" className={commonStyle["toast-bell-icon"]} /> <span className={commonStyle["toast-title"]}>{this.props.title.toUpperCase()}</span>
                </div>
                <div className={commonStyle["toast-detail"]}>
                    {this.props.detail}
                </div>
            </div>
        );
    }
}

export default Toast;
