import React, { Component } from 'react';
import {connect} from 'react-redux';
import './Debug.scss';

class Debug extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pre: [],
        }
    }

    componentDidMount() {
        let {socket} = this.props;
        socket.emit('get lang word', {}, (response) => {
            this.setState(state => {
                return {pre: [...state.pre, response]};
            });
            let {word} = response.res;
            word = {
                ...word,
                key: 'another_test',
                string: "Another test",
            };
            socket.emit('post lang word', {word}, res => {
                this.setState(state => {
                    return {pre: [...state.pre, res]};
                });
            });
        });
    }

    render() {
        let {client} = this.props;
        return (
            <pre>
                {JSON.stringify(this.state.pre, null, 4)}
            </pre>
        );
    }
}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        client : state.client
    }
};

export default connect(mapStateToProps)(Debug);