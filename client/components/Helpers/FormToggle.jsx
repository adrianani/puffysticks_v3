import React, { Component } from 'react';

class FormToggle extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     get description () {
         let {description} = this.props;
         if (description === undefined) return null;

         return (
             <p className={`description`}>
                 {description}
             </p>
         );
     }

     render() {

          return (
               <div className={`form-group toggle-form-group`}>
                   <label className={`no-select`}>
                       <span>{this.props.label}</span>
                       <input
                           type={'checkbox'}
                           checked={this.props.value || false}
                           onChange = {e => this.props.onChange(e.target.checked, e)}
                       />
                       <div className={`fake-toggle`} />
                   </label>
                   {this.description}
               </div>
          );

     }

}

export default FormToggle;