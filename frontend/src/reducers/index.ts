import { combineReducers } from "redux";
import { StoreState } from "../store/types";
import ethMisc from "./eth";
import pollMisc from "./poll";

export default combineReducers<StoreState>({
    ethMisc,
    pollMisc,
});
