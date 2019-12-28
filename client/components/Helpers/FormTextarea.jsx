import React, { Component } from 'react';
import FormGroup from "./FormGroup";

class FormTextarea extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let {
            onChange,
            placeholder,
            label,
            description,
            darkTheme,
            error
        } = this.props;

        let inputExtraClass = ``;

        if (darkTheme) {
            inputExtraClass = 'dark';
        }

        return (
            <FormGroup label={label} description={description} error={error} >
                <div className={`form-group-input`}>
                    <textarea
                        className={inputExtraClass}
                        value={this.props.value}
                        onChange={e => onChange(e.target.value, e)}
                        placeholder={placeholder}
                    />
                </div>
            </FormGroup>
        );

    }

}

export default FormTextarea;