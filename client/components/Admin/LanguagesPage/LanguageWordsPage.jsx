import React, { Component } from 'react';
import WordsList from "./WordsList";
import {connect} from 'react-redux';
import LangList from "./LangList";

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

         return (
             <LangList
                 languages = {[{_id : ``, shortcut : `all`, name : `all`, translate : true}, ...languages]}
                 selectedLanguage = {selectedLanguage}
                 selectLanguage = {this.selectLanguage}
             />
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