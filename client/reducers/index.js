import {combineReducers} from "redux";

import socketReducer from "./socketReducer";
import clientReducer from "./clientReducer";
import errorsReducer from './errorsReducer';
import langReducer from "./langReducer";
import modalMessagesReducer from "./modalMessagesReducer";

const allReducers = combineReducers({
    socket : socketReducer,
    client : clientReducer,
    errors : errorsReducer,
    lang : langReducer,
    modalMessages : modalMessagesReducer
});

export default allReducers;