import React from "react";
import { IMainFooterStates, IMainFooterProps } from "./types/MainFooter";
import { Icon } from "semantic-ui-react";
import style from "./MainFooter.module.css";

class MainFooter extends React.Component<IMainFooterProps, IMainFooterStates> {
    constructor(props: IMainFooterProps) {
        super(props);
    }

    render() {
        return(
            <div className={[style["vertical-align"], style.link].join(" ")}>
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/junzhli/ethereum-dapp-voting-dpolls"><Icon name="github" link={true} /> View on Github</a> ● Code licensed under MIT License / Jeremy Li ● <a target="_blank" rel="noopener noreferrer" href="https://www.buymeacoffee.com/XSNsIxjm2"><Icon name="coffee" link={true} /> Buy me a drink</a>
            </div>
        );
    }
}

export default MainFooter;
