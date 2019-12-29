import React, { Component } from 'react';
import {connect} from 'react-redux';

class ErrorMessage extends Component {

    constructor(props) {
        super(props);

        this.timeout = null;
    }

    componentDidMount() {
        let {removeError, error} = this.props;
        this.timeout = setTimeout(() => {
            removeError(error.id);
        }, 5000);
    }

    close = () => {
        let {removeError, error} = this.props;
        clearTimeout(this.timeout);
        removeError(error.id);
    }

    render() {
        let {error} = this.props;

        return (
            <div className={`Error-message`}>
                   <span>
                       {this.props.Lang.getWord(error.message)}
                   </span>
                <button
                    className={`btn`}
                    onClick={this.close}
                >
                    {this.props.Lang.getWord("cancel")}
                </button>
            </div>
        );

    }

}

const mapStateToProps = state => {
    return {
        Lang : state.lang
    }
}

const mapDispatchToProps = dispatch => {
    return {
        removeError : (id) => dispatch({type: 'REMOVE_ERROR', id})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage);