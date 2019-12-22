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
        socket.emit('get lang words', {key: 'contact_us', langid: '5dffee66efc7281a2cf623a5'}, (res) => {
            console.log(res);
            this.setState(state => {
                return {pre: [...state.pre, res]};
            });
        });
        socket.emit('get lang words', {key: 'categories', langid: '5dffee66efc7281a2cf623a5'}, (res) => {
            console.log(res);
            this.setState(state => {
                return {pre: [...state.pre, res]};
            });
        });
        socket.emit('get lang words', {key: 'logos', langid: '5dffee66efc7281a2cf623a5'}, (res) => {
            console.log(res);
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