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
        socket.emit('get lang word', {wordId: '5e01032a2a784d2c201839e4'}, (response) => {
            this.setState(state => {
                return {pre: [...state.pre, response]};
            });
            let {word} = response.res;
            word = {
                ...word, 
                string: "just testing3333",
            }
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