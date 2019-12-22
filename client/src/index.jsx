import React from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

let socket = io('http://localhost:8080');

class App extends React.Component {

    render() {
        return (
            <div>
                hello world
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));