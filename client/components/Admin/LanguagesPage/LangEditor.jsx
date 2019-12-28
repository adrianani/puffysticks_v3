import React, { Component } from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import FormInput from "../../Helpers/FormInput";
import FormToggle from "../../Helpers/FormToggle";
import FormDropdown from "../../Helpers/FormDropdown";

class LangEditor extends Component {

     constructor(props) {
            super(props);

            this.state = {
                languages : [],
                defaultLanguage : null,
                selectedLanguage : ``,
                lang : {
                    shortcut : ``,
                    name : ``,
                    default : false
                }
            };
     }

     get selectedLanguage () {
         return this.state.selectedLanguage || this.state.defaultLanguage;
     }

    updateLanguages = ({success, res, errors}) => {
        if (success) {
            this.setState({languages : res.languages.map(lang => ({value : lang._id, text : lang.name})), defaultLanguage : res.defaultLanguage}            );
        } else {
            this.props.addError(errors);
        }
    }

    refreshLanguages = () => {
        let {langId} = this.props.match.params;
        if (!langId) {
            let {socket} = this.props;

            socket.emit(`get all languages`, this.updateLanguages);
        }
    }

     updateLang = ({success, res, errors}) => {
         if (success) {
             this.setState({lang : res.lang});
             return;
         }

         this.props.addError(errors);
     }

     refreshLang = () => {
         let {langId} = this.props.match.params;
         if (!langId) return;
         let {socket} = this.props;

         socket.emit(`get language`, {langId}, this.updateLang);
     }

     componentDidMount() {
         this.refreshLang();
         this.refreshLanguages();
     }

     get title () {
         let {langId} = this.props.match.params;
         if (!langId) return `add new language`;
         return `edit language`;
     }

     updateLangField = (k, v) => {
         let {lang} = this.state;
         lang[k] = v;
         this.setState({lang});
     }

     getLangBaseDropdown = () => {
         let {langId} = this.props.match.params;
         if (!langId) {
             let {languages} = this.state;
             return (
                 <FormDropdown
                     label = {`base language`}
                     description = {`pick the language this one inherits their words from`}
                     options = {languages}
                     selectedOption = {this.selectedLanguage}
                     selectOption = {selectedLanguage => this.setState({selectedLanguage})}
                 />
             );
         }
         return null;
     }

     handleResponse = ({success, errors}) => {
         if (success) {
             this.props.history.push("/admin/languages");
         } else {
             this.props.addError(errors);
         }
     }

     submit = e => {
         e.preventDefault();
         let {socket} = this.props;
         let {langId} = this.props.match.params;

         if (!langId) {
             socket.emit(`post language`, {lang : this.state.lang, baseLang : this.selectedLanguage}, this.handleResponse);
             return;
         }

         socket.emit(`put language`, {lang : this.state.lang}, this.handleResponse);
     }

     delete = e => {
         e.preventDefault();
         let {socket} = this.props;
         let {langId} = this.props.match.params;
         if (!langId) return;

         socket.emit(`delete language`, {langid : langId}, this.handleResponse);
     }

     getDeleteBtn = () => {
         let {langId} = this.props.match.params;
         if (!langId) return null;

         return (
             <button
                 className={`btn`}
                 onClick={this.delete}
             >
                 delete
             </button>
         );
     }

    render() {

          return (
               <div className={`Admin-editor`}>
                   <h1>{this.title}</h1>
                   <form onSubmit={this.submit}>
                       <FormInput
                           label = {`name`}
                           description = {`the name of this language`}
                           value = {this.state.lang.name}
                           onChange = {(v) => this.updateLangField("name", v)}
                           darkTheme = {true}
                       />
                       <FormInput
                           label = {`shortcut`}
                           description = {`the shortened form of this language's name (e.g for "english" it would be "en")`}
                           value = {this.state.lang.shortcut}
                           onChange = {(v) => this.updateLangField("shortcut", v)}
                           darkTheme = {true}
                       />
                       <FormToggle
                           label = {`default`}
                           description = {`make this language the default one of the platform`}
                           value = {this.state.lang.default}
                           onChange = {v => this.updateLangField("default", v)}
                       />
                       {this.getLangBaseDropdown()}

                       <div className={`btns-container`}>
                           <button
                               className={`btn primary`}
                               onClick={this.submit}
                           >
                               submit
                           </button>
                           {this.getDeleteBtn()}
                           <Link to={`/admin/languages`} className={`empty btn`}>
                               cancel
                           </Link>
                       </div>
                   </form>
               </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LangEditor));