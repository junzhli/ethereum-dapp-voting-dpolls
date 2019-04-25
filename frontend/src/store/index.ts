import rootReducer from '../reducers';
import { createStore } from 'redux';

export type AppState = ReturnType<typeof rootReducer>;

const configureStore = () => {
    const store = createStore(
        rootReducer
    );

    return store;
};

export default configureStore();
