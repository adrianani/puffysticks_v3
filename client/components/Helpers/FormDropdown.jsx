import React, { Component } from 'react';
import FormGroup from "./FormGroup";
import DropdownOptions from "./DropdownOptions";

class FormDropdown extends Component {

     constructor(props) {
            super(props);

            this.state = {
                active : false
            };

            this._placeholder = "select an option";
     }

     get headerText () {
         let {options, selectedOption} = this.props;

         if (!selectedOption) {
             return this.props.placeholder || this._placeholder;
         }

         let option = options.find(o => o.value === selectedOption);
         return option.text;
     }

     get options () {
         if (!this.state.active) return null;
         let {options, selectedOption, selectOption} = this.props;

         return (
             <DropdownOptions
                 options = {options}
                 selectedOption = {selectedOption}
                 selectOption = {selectOption}
                 close = {() => this.setState({active : false})}
             />
         );
     }

     render() {
         let activeClass = this.state.active ? " active" : "";

          return (
               <FormGroup label={this.props.label} description={this.props.description} error={this.props.error}>
                   <div className={`dropdown-container${activeClass} no-select`}>
                       <div className={`dropdown-header`} onClick={() => this.setState({active : true})}>
                           <span>{this.headerText}</span>
                           <i className={`pufficon-dropdown`} />
                       </div>
                       {this.options}
                   </div>
               </FormGroup>
          );

     }

}

export default FormDropdown;