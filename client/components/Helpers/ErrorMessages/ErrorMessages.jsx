import React, { Component } from 'react';
import './ErrorMessages.scss';
import {connect} from 'react-redux';
import ErrorMessage from "./ErrorMessage";

class ErrorMessages extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    get errors () {
        let {errors} = this.props;

        return errors.map((err) => {
            return (
                <ErrorMessage
                    key={err.id}
                    error={err}
                />
            );
        });
    }

    render() {
        let {errors} = this.props;

        if (!errors || !errors.length) return null;

        return (
            <div className={`Error-messages-container`}>
                {this.errors}
            </div>
        );

    }

}

const mapStateToProps = state => {
    return {
        errors : state.errors
    }
}

export default connect(mapStateToProps)(ErrorMessages);