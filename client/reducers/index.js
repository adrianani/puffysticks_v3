import {combineReducers} from "redux";

import socketReducer from "./socketReducer";
import clientReducer from "./clientReducer";
import errorsReducer from './errorsReducer';

const allReducers = combineReducers({
    socket : socketReducer,
    client : clientReducer,
    errors : errorsReducer
});

export default allReducers;