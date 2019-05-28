import { combineReducers } from "redux";
import { StoreState } from "../store/types";
import ethMisc from "./eth";
import pollMisc from "./poll";
import userMisc from "./user";

export default combineReducers<StoreState>({
    ethMisc,
    pollMisc,
    userMisc,
});
