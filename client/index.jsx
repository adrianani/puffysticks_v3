import React from "react";
import ReactDOM from "react-dom";
import io from "socket.io-client";

let socket = io('http://localhost:8080');

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pre: [],
        }
    }

    componentDidMount() {
        socket.emit('get user info', {userId: '5e00e7285f8ac5575cbb19b4'}, (res) => {
            this.setState(state => {
                return {pre: [...state.pre, res]};
            });
        });
    }

    render() {

        return (
            <pre>
                {JSON.stringify(this.state.pre, null, 4)}
            </pre>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));