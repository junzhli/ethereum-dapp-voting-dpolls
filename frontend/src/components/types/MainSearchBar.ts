export namespace IMainSearchBar {
    export interface IInnerProps {
    }

    export interface IStateFromProps {
    }

    export interface IPropsFromDispatch {
        setUserSearchKeywords: (keywords: string | null) => void;
    }
}

export type IMainSearchBarProps = IMainSearchBar.IInnerProps & IMainSearchBar.IStateFromProps & IMainSearchBar.IPropsFromDispatch;

export interface IMainSearchBarStates {
}
