import React, { Component } from 'react';
import WordsList from "./WordsList";
import {connect} from 'react-redux';

class LanguageWordsPage extends Component {

     constructor(props) {
            super(props);

            this.state = {
                languages : [
                ],
                selectedLanguage : ``
            };
     }

     componentDidMount() {
         this.refreshLanguages();
     }

    updateLanguages = ({success, res, errors}) => {
         if (success) {
             this.setState({languages : res.languages});
         } else {
             this.props.addError(errors);
         }
     }

     refreshLanguages = () => {
         let {socket} = this.props;

         socket.emit(`get all languages`, this.updateLanguages);
     }

     selectLanguage = selectedLanguage => this.setState({selectedLanguage});

     getLanguageSelector = () => {
         let {languages, selectedLanguage} = this.state;

         let res = languages.map(lang => {
             let selected = lang._id === selectedLanguage ? " selected" : "";
             return (
                 <li key={lang._id}>
                     <button
                         className={`empty btn${selected}`}
                         onClick={() => this.selectLanguage(lang._id)}
                     >{lang.shortcut}</button>
                 </li>
             );
         });

         let selected_all = selectedLanguage === `` ? " selected" : "";

         return (
             <ul className={`language-select-nav`}>
                 <li key={`all`}>
                     <button
                         className={`empty btn${selected_all}`}
                         onClick={() => this.selectLanguage(``)}
                     >all</button>
                 </li>
                 {res}
             </ul>
         );
     }

     render() {

          return (
               <>
                   {this.getLanguageSelector()}
                   <WordsList
                       key={this.state.selectedLanguage}
                       moreOptions={{selectedLanguage : this.state.selectedLanguage}}
                   />
               </>
          );

     }

}

const mapStateToProps = state => {
    return {
        socket : state.socket
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguageWordsPage);