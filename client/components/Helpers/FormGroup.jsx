import React, { Component } from 'react';

class FormGroup extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    get showError() {
        let {error} = this.props;

        if (error) {
            return (
                <div className={`form-group-error`}>
                    {error}
                </div>
            );
        }

        return (
            <></>
        );
    }

    get showDescription() {
        let {description} = this.props;

        if (description) {
            return (
                <span className={`description`}>{description}</span>
            );
        }

        return (<></>);
    }

    render() {
        let {label} = this.props;

        return (
            <div className={`form-group`}>
                <div className={`form-group-label`}>
                    <label>{label}</label>
                    {this.showDescription}
                </div>
                {this.props.children}

                {this.showError}

            </div>
        );

    }

}

export default FormGroup;