import React, { Component } from 'react';
import './Footer.scss';
import {connect} from "react-redux";
import LanguageSelectOptions from "./LanguageSelectOptions";

class Footer extends Component {

     constructor(props) {
            super(props);
            
            this.state = {
                languages : [],
                defaultLanguage : null,
                selectedLanguage : props.Lang.langId,
                languageSelectActive : false
            };
     }

    get selectedLanguage () {
        return this.state.selectedLanguage || this.state.defaultLanguage;
    }

    updateLanguages = ({success, res, errors}) => {
        if (success) {
            this.setState({languages : res.languages, defaultLanguage : res.defaultLanguage}
            );
        } else {
            this.props.addError(errors);
        }
    }

    refreshLanguages = () => {
        this.props.socket.emit(`get all languages`, this.updateLanguages);
    }

    componentDidMount() {
         this.refreshLanguages();
    }

    getLanguageSelector = () => {
         let {languages} = this.state;
         let lang = languages.find(l => l._id === this.selectedLanguage);

         let options = null;
         if (this.state.languageSelectActive) {
             options = (
                 <LanguageSelectOptions
                    close={() => this.setState({languageSelectActive : false})}
                    options = {languages.filter(l => l._id !== this.selectedLanguage)}
                    select = {this.props.Lang.setLangId}
                />
             );
         }
         return (
             <div className={`language-selector`}>
                 <div
                     className={`selected-language`}
                     onClick={() => this.setState({languageSelectActive : true})}
                 >
                     {lang.shortcut}
                 </div>
                 {options}
             </div>
         );
    }

     render() {
         if (!this.state.languages.length) return null;
     
          return (
               <footer>
                <div className={`puffysticks-cr`}>
                    puffysticks 2020
                </div>

                   {this.getLanguageSelector()}
               </footer>
          );
      
     }
 
}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        Lang : state.lang
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error}),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Footer);