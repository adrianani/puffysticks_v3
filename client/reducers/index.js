import {combineReducers} from "redux";

import socketReducer from "./socketReducer";
import clientReducer from "./clientReducer";
import errorsReducer from './errorsReducer';
import langReducer from "./langReducer";

const allReducers = combineReducers({
    socket : socketReducer,
    client : clientReducer,
    errors : errorsReducer,
    lang : langReducer
});

export default allReducers;