import React, { Component } from 'react';
import onClickOutside from 'react-onclickoutside';

class LanguageSelectOptions extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     handleClickOutside = e => {
         this.props.close();
     }

     get options () {
         let {options, select} = this.props;

         return options.map(option => {
             return (
                 <li
                     key={option._id}
                     onClick={() => select(option._id)}
                 >
                     {option.shortcut}
                 </li>
             );
         })
     }

     render() {

          return (
               <ul className={`language-selector-options`}>
                   {this.options}
               </ul>
          );

     }

}

export default onClickOutside(LanguageSelectOptions);