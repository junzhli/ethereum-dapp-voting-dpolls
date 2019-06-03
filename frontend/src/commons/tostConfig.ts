import { ToastContainerProps, Slide } from "react-toastify";
import style from "../commons/styles/index.module.css";

const toastConfig: ToastContainerProps = {
    position: "bottom-left",
    hideProgressBar: true,
    transition: Slide,
    style: {
        className: style["toast-card"],
        bodyClassName: style["toast-card"],
        progressClassName: style["toast-card"],
    },
    toastClassName: style["toast-card"],
    className: style["toast-card-container"],
};

export default toastConfig;
