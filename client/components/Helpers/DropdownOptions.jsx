import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

class DropdownOptions extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     handleClickOutside = _ => {
         this.props.close();
     }

     get options () {
         let {options, selectedOption, selectOption} = this.props;
         return options.map(option => {
             let selected = option.value === selectedOption ? ' selected' : '';
             return (
                 <li
                     key={option.value}
                     className={selected}
                     onClick={() => {selectOption(option.value); this.props.close();}}
                 >
                     {option.text}
                 </li>
             );
         })
     }

     render() {

          return (
               <ul className={`dropdown-options`}>
                   {this.options}
               </ul>
          );

     }

}

export default onClickOutside(DropdownOptions);