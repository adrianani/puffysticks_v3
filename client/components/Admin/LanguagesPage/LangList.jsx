import React, { Component } from 'react';
import {connect} from 'react-redux';

class LangList extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

         let {languages, selectedLanguage} = this.props;

         let res = languages.map(lang => {
             let selected = lang._id === selectedLanguage ? " selected" : "";
             let str = lang.translate ? this.props.Lang.getWord(lang.shortcut) : lang.shortcut;
             return (
                 <li key={"lang-" + lang._id}>
                     <button
                         className={`empty btn${selected}`}
                         onClick={() => this.props.selectLanguage(lang._id)}
                     >{str}</button>
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

const mapStateToProps = state => {
    return {
        Lang : state.lang
    }
}

export default connect(mapStateToProps)(LangList);