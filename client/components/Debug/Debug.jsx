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
        socket.emit('login with name and password', {name: 'Portocala', password: 'lol12'}, (response) => {
            this.setState(state => {
                return {pre: [...state.pre, response]};
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