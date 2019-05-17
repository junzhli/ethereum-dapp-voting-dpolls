import { createStore } from "redux";
import rootReducer from "../reducers";

export type AppState = ReturnType<typeof rootReducer>;

const configureStore = () => {
    const store = createStore(
        rootReducer,
    );

    return store;
};

export default configureStore();
