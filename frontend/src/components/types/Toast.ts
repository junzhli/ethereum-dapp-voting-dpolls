export namespace IToast {
    export interface IInnerProps {
        title: string;
        detail: JSX.Element | string;
    }

    export interface IStateFromProps {
    }
}

export type IToastProps = IToast.IInnerProps & IToast.IStateFromProps;

export interface IToastStates {
}
