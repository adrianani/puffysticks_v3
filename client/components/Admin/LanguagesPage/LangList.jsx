import React, { Component } from 'react';

class LangList extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

         let {languages, selectedLanguage} = this.props;

         let res = languages.map(lang => {
             let selected = lang._id === selectedLanguage ? " selected" : "";
             return (
                 <li key={"lang-" + lang._id}>
                     <button
                         className={`empty btn${selected}`}
                         onClick={() => this.props.selectLanguage(lang._id)}
                     >{lang.shortcut}</button>
                 </li>
             );
         });

         return (
             <ul className={`language-select-nav`}>
                 {res}
             </ul>
         );

     }

}

export default LangList;