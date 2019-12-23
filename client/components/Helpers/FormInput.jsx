import React, { Component } from 'react';
import FormGroup from "./FormGroup";

class FormInput extends Component {

    constructor(props) {
        super(props);

        this.state = {
            _pass_visible : false // if field is a password toggle visibility
        };
    }

    togglePassVisibility = () => {
        this.setState({_pass_visible : !this.state._pass_visible});
    }

    get _passwordEye() {
        let {type} = this.props;
        let {_pass_visible} = this.state;

        if (type !== 'password') {
            return (<></>);
        }

        let iconName = 'eye';

        if (_pass_visible) {
            iconName = 'eye-slash';
        }

        return (
            <i
                className={`pufficon-${iconName} no-select`}
                onClick={this.togglePassVisibility}
            />
        );
    }

    render() {
        let {
            onChange,
            type,
            placeholder,
            label,
            description,
            darkTheme,
            error
        } = this.props;

        let {_pass_visible} = this.state;

        let inputExtraClass = ``;
        if (type === 'password') {
            inputExtraClass += ' isPassword';

            if (_pass_visible) {
                type = 'text';
            }
        }

        if (darkTheme) {
            inputExtraClass += ' dark';
        }

        return (
            <FormGroup label={label} description={description} error={error} >
                <div className={`form-group-input`}>
                    <input
                        className={inputExtraClass}
                        type={type}
                        value={this.props.value}
                        onChange={e => onChange(e.target.value, e)}
                        placeholder={placeholder}
                        step = {this.props.step}
                    />
                    {this._passwordEye}
                </div>
            </FormGroup>
        );

    }

}

export default FormInput;