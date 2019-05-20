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
                <a target="_blank" rel="noopener noreferrer" href="https://github.com/junzhli/ethereum-dapps-final-project"><Icon name="github" link={true} /></a> Code licensed under MIT License @ Jeremy Li
            </div>
        );
    }
}

export default MainFooter;
