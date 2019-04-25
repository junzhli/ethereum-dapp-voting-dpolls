import { combineReducers } from 'redux';
import { StoreState } from '../store/types';
import ethMisc from './eth';


export default combineReducers<StoreState>({
    ethMisc
})