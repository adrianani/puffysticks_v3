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
        socket.emit('get lang words', {key: ['contact_us', 'web_design'], langid: '5e00193c7243874e808da42a'}, (res) => {
            this.setState(state => {
                return {pre: [...state.pre, res]};
            });
        });
        socket.emit('get lang words', {key: 'categories', langid: '5e00193c7243874e808da42a'}, (res) => {
            this.setState(state => {
                return {pre: [...state.pre, res]};
            });
        });
        socket.emit('get lang words', {key: 'logos', langid: '5e00193c7243874e808da42a'}, (res) => {
            this.setState(state => {
                return {pre: [...state.pre, res]};
            });
        });
    }

    render() {
        let {client} = this.props;
        console.log({client});
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