export namespace IToast {
    export interface IInnerProps {
        title: string;
        detail: string;
    }

    export interface IStateFromProps {
    }
}

export type IToastProps = IToast.IInnerProps & IToast.IStateFromProps;

export interface IToastStates {
}
