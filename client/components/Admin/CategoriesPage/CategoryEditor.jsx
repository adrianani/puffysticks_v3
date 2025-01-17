import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from "react-router-dom";
import FormInput from "../../Helpers/FormInput";
import LangList from "../LanguagesPage/LangList";

class CategoryEditor extends Component {

     constructor(props) {
            super(props);

            this.state = {
                languages : [],
                defaultLanguage : null,
                selectedLanguage : ``,
                category : {}
            };
     }

    get selectedLanguage () {
        return this.state.selectedLanguage || this.state.defaultLanguage;
    }

     get title() {
         let {categoryId} = this.props.match.params;
         if (!categoryId) return this.props.Lang.getWord("add_category");
         return this.props.Lang.getWord("edit_category");
     }

     updateCategory = ({success, res, errors}) => {
         console.log({success, res, errors});
         if (!success) {
             this.props.addError(errors);
             return;
         }

         let category = {};
         res.words.forEach(word => {
             category[word.langid] = word.string;
         });

         this.setState({category});
     }

     refreshCategory = () => {
         let {categoryId} = this.props.match.params;
         let {languages} = this.state;
         if (!categoryId) {
             let category = {};
             languages.forEach(lang => {
                 category[lang._id] = ``;
             });
             this.setState({category});
         } else {
             this.props.socket.emit(`get word in all languages`, {keys : [`category_title_${categoryId}`]}, this.updateCategory);
         }
     }

    updateLanguages = ({success, res, errors}) => {
        if (success) {
            this.setState(
                {languages : res.languages, defaultLanguage : res.defaultLanguage},
                () => this.refreshCategory()
            );
        } else {
            this.props.addError(errors);
        }
    }

    refreshLanguages = () => {
        let {socket} = this.props;

        socket.emit(`get all languages`, this.updateLanguages);
    }

     componentDidMount() {
         this.refreshLanguages();
     }

    selectLanguage = selectedLanguage => this.setState({selectedLanguage});

    getLangList = () => {
        return (
            <LangList
                languages = {this.state.languages}
                selectedLanguage = {this.selectedLanguage}
                selectLanguage = {this.selectLanguage}
            />
        );
    }

     updateCategoryName = name => {
         let {category} = this.state;
         category[this.selectedLanguage] = name;
         this.setState({category});
     }

     getDeleteBtn = () => {
         let {categoryId} = this.props.match.params;
         if (!categoryId) return null;

         return (
             <button
                 className={`btn`}
                 onClick={e => {
                     e.preventDefault();
                     this.props.addIrreversibleConfirmation({accept : this.delete});
                 }}
             >
                 {this.props.Lang.getWord('delete')}
             </button>
         );
     }

    handleResponse = ({success, errors}) => {
        if (success) {
            // this.props.history.push("/admin/categories");
            window.location.replace("/admin/categories");
        } else {
            this.props.addError(errors);
        }
    }

     submit = e => {
         e.preventDefault();
         let {socket} = this.props;
         let {categoryId} = this.props.match.params;

         if (!categoryId) {
             socket.emit(`post category`, {category : this.state.category}, this.handleResponse);
             return;
         }

         socket.emit(`put category`, {categoryId, category : this.state.category}, this.handleResponse);
     }

    delete = () => {
        let {socket} = this.props;
        let {categoryId} = this.props.match.params;

        if (!categoryId) return;

        socket.emit(`delete category`, {categoryId}, this.handleResponse);
    }

    render() {

          return (
               <div className={`Admin-inner-page`}>
                   <div className={`Admin-editor`}>
                       <h1>{this.title}</h1>
                       {this.getLangList()}
                       <form
                           onSubmit={this.submit}
                       >
                           <FormInput
                               label = {this.props.Lang.getWord("category_name")}
                               description = {this.props.Lang.getWord("category_name_desc")}
                               value = {this.state.category[this.selectedLanguage] || ""}
                               onChange = {v => this.updateCategoryName(v)}
                               darkTheme = {true}
                           />

                           <div className={`btns-container`}>
                               <button
                                   className={`btn primary`}
                                   onClick={this.submit}
                               >
                                   {this.props.Lang.getWord('submit')}
                               </button>
                               {this.getDeleteBtn()}
                               <Link to={`/admin/categories`} className={`empty btn`}>
                                   {this.props.Lang.getWord('cancel')}
                               </Link>
                           </div>
                       </form>
                   </div>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CategoryEditor));