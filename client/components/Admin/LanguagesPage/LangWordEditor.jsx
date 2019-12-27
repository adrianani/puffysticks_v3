import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import LangList from "./LangList";
import FormInput from "../../Helpers/FormInput";
import FormTextarea from "../../Helpers/FormTextarea";

class LangWordEditor extends Component {

     constructor(props) {
            super(props);

            this.state = {
                languages : [],
                defaultLanguage : null,
                selectedLanguage : ``,
                loading : true,
                wordKey : ``,
                wordString : [],
            };
     }

     get selectedLanguage () {
         return this.state.selectedLanguage || this.state.defaultLanguage;
     }

     selectLanguage = selectedLanguage => this.setState({selectedLanguage});

    updateLanguages = ({success, res, errors}) => {
        if (success) {
            this.setState(
                {languages : res.languages, defaultLanguage : res.defaultLanguage},
                () => this.refreshWord()
                );
        } else {
            this.props.addError(errors);
        }
    }

    refreshLanguages = () => {
         let {wordId} = this.props.match.params;
         if (!wordId) {
             let {socket} = this.props;

             socket.emit(`get all languages`, this.updateLanguages);
             return;
         }
        this.refreshWord();
    }

    updateWord = ({success, res, errors}) => {
        if (!success) {
            this.props.addError(errors);
            return;
        }
        let {wordId} = this.props.match.params;

        if (!wordId) {
            console.log("langs", this.state.languages);
            let wordString = this.state.languages.map(lang => {
               return {
                   langid : lang._id,
                   string : ``
               }
            });
            this.setState({loading : false, wordKey : ``, wordString});
        } else {
            this.setState({loading : false, wordKey : res.word.key, wordString : [{langid : res.word.langid, string : res.word.string}]});
        }

    }

    refreshWord = () => {
        let {wordId} = this.props.match.params;
        let {socket} = this.props;

        socket.emit(`get lang word`, {wordId}, this.updateWord);
    }

    componentDidMount() {
         this.refreshLanguages();
    }

    getLangList = () => {
        let {wordId} = this.props.match.params;
        if (!wordId) {
            return (
                <LangList
                    languages = {this.state.languages}
                    selectedLanguage = {this.selectedLanguage}
                    selectLanguage = {this.selectLanguage}
                />
            );
        }
        return null;
    }

    getWordString = () => {
        let {wordString} = this.state;
        let {wordId} = this.props.match.params;

        if (!wordId) {
            let word = wordString.find(w => w.langid === this.selectedLanguage);
            return word.string;
        }
        return wordString[0].string;
    }

    setWordString = string => {
        let {wordString} = this.state;
        let {wordId} = this.props.match.params;

        if (!wordId) {
            let i = wordString.findIndex(w => w.langid === this.selectedLanguage);
            wordString[i].string = string;
        } else {
            wordString[0].string = string;
        }

        this.setState({wordString});
    }

    setWordKey = wordKey => this.setState({wordKey});

    get title () {
        let {wordId} = this.props.match.params;
        if (!wordId) return `create new word`;
        return `edit word`;
    }

    getDeleteBtn = () => {
        let {wordId} = this.props.match.params;

        if (!wordId) return null;

        return (
            <button className={`btn`}>
                delete
            </button>
        );
    }

    cancel = e => {
        e.preventDefault();
        this.props.history.push('/admin/languages/words');
    }

    handleSubmitResponse = ({success, error}) => {
        if (success) {
            this.props.history.push('/admin/languages/words');
        } else {
            this.props.addError(error);
        }
    }

    submit = e => {
        e.preventDefault();
        let {socket} = this.props;
        let {wordId} = this.props.match.params;
        let {wordKey, wordString} = this.state;

        let words = wordString.map(s => {
            return {
                key : wordKey,
                string : s.string,
                langid : s.langid
            }
        });

        if (!wordId) {
            socket.emit(`post words`, {words}, this.handleSubmitResponse);
        } else {
            words[0]._id = wordId;
            socket.emit(`put words`, {words}, this.handleSubmitResponse);
        }
    }

    render() {
        if (this.state.loading) return null;

          return (
               <>
                   <h1>{this.title}</h1>
                   {this.getLangList()}
                   <form>
                       <FormInput
                           label = {`word key`}
                           description = {`the key this word will be identified and queried by`}
                           value = {this.state.wordKey}
                           onChange = {this.setWordKey}
                       />
                       <FormTextarea
                           label = {`word string`}
                           description = {`the translated string the client will read`}
                           value = {this.getWordString()}
                           onChange = {this.setWordString}
                       />

                       <div className={`btns-container`}>
                           <button
                               className={`btn primary`}
                               onClick={this.submit}
                           >
                               submit
                           </button>
                           {this.getDeleteBtn()}
                           <button
                               className={`empty btn`}
                               onClick={this.cancel}
                           >
                               cancel
                           </button>
                       </div>
                   </form>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LangWordEditor));