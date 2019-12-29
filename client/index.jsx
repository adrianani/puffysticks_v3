import React from "react";
import ReactDOM from "react-dom";
import Main from './components/Main';
import {Provider} from 'react-redux';
import store from './store';
import Client from "./classes/Client";

import io from "socket.io-client";
import Lang from "./classes/Lang";

let socket = io('http://localhost:8080');

store.dispatch({type : 'UPDATE_SOCKET', socket});

let client = new Client();
client.init();

let lang = new Lang();

ReactDOM.render(
    <Provider store={store}>
        <Main />
    </Provider>,
    document.getElementById('app'));