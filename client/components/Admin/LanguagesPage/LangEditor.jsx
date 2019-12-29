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
         if (!langId) return this.props.Lang.getWord('add_language');
         return this.props.Lang.getWord('edit_language');
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
                     label = {this.props.Lang.getWord('lang_base_lang')}
                     description = {this.props.Lang.getWord('lang_base_lang_desc')}
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

     delete = () => {
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
                 onClick={e => {
                     e.preventDefault();
                     this.props.addIrreversibleConfirmation({accept : this.delete});
                 }}
             >
                 {this.props.Lang.getWord("delete")}
             </button>
         );
     }

    render() {

          return (
               <div className={`Admin-editor`}>
                   <h1>{this.title}</h1>
                   <form onSubmit={this.submit}>
                       <FormInput
                           label = {this.props.Lang.getWord('lang_name')}
                           description = {this.props.Lang.getWord('lang_name_desc')}
                           value = {this.state.lang.name}
                           onChange = {(v) => this.updateLangField("name", v)}
                           darkTheme = {true}
                       />
                       <FormInput
                           label = {this.props.Lang.getWord('lang_shortcut')}
                           description = {this.props.Lang.getWord('lang_shortcut_desc')}
                           value = {this.state.lang.shortcut}
                           onChange = {(v) => this.updateLangField("shortcut", v)}
                           darkTheme = {true}
                       />
                       <FormToggle
                           label = {this.props.Lang.getWord('lang_default')}
                           description = {this.props.Lang.getWord('lang_default_desc')}
                           value = {this.state.lang.default}
                           onChange = {v => this.updateLangField("default", v)}
                       />
                       {this.getLangBaseDropdown()}

                       <div className={`btns-container`}>
                           <button
                               className={`btn primary`}
                               onClick={this.submit}
                           >
                               {this.props.Lang.getWord('submit')}
                           </button>
                           {this.getDeleteBtn()}
                           <Link to={`/admin/languages`} className={`empty btn`}>
                               {this.props.Lang.getWord('cancel')}
                           </Link>
                       </div>
                   </form>
               </div>
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
        addIrreversibleConfirmation : (funcs) => dispatch({type : "ADD_IRREVERSIBLE_CONFIRMATION", ...funcs})
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LangEditor));