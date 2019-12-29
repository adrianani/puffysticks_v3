import React, { Component } from 'react';
import './LanguagesPage.scss';
import AdminPage from "../AdminPage";
import LanguagesListPage from "./LanguagesListPage";
import {Link, Route, Switch} from "react-router-dom";
import LanguageWordsPage from "./LanguageWordsPage";
import LangWordEditor from "./LangWordEditor";
import LangEditor from "./LangEditor";
import {connect} from 'react-redux';

const _path = `/admin/languages`;
class LanguagesPage extends AdminPage {

     constructor(props) {
            super(props);

            this.state = {};

            this.pageKey = `languages`;

            this.navItems = [
                {
                    title : 'languages',
                    key : 'languages',
                    url : _path
                },
                {
                    title : 'words',
                    key : 'words',
                    url : `${_path}/words`
                }
            ];
     }

     getHorizontalNav = activeItem => {
         let items = this.navItems.map(item => {
             let selected = activeItem === item.key ? 'selected' : '';
            return (
                <li key={item.key}>
                    <Link to={item.url} className={selected}>
                        {this.props.Lang.getWord(item.title)}
                    </Link>
                </li>
            );
         });

         return (
             <ul className={`admin-horizontal-nav no-select`}>
                 {items}
             </ul>
         );
     }

     render() {

          return (
               <div className={`Admin-inner-page Languages-page`}>

                       <Switch>
                           <Route path={`${_path}/new`}>
                               <LangEditor />
                           </Route>
                           <Route path={`${_path}/edit/:langId`}>
                               <LangEditor />
                           </Route>
                           <Route exact path={_path}>
                               {this.getHorizontalNav('languages')}
                               <h1 className={`headline-btn`}>
                                   {this.props.Lang.getWord("languages")}
                                   <Link
                                       className={`btn primary`}
                                       to={`${_path}/new`}
                                   >{this.props.Lang.getWord("add_language")}</Link>
                               </h1>

                               <div className={`main-container`}>
                               <LanguagesListPage />
                               </div>
                           </Route>
                           <Route path={`${_path}/words/new`}>
                               <LangWordEditor />
                           </Route>
                           <Route path={`${_path}/words/edit/:wordId`}>
                               <LangWordEditor />
                           </Route>
                           <Route exact path={`${_path}/words`}>
                               {this.getHorizontalNav('words')}
                               <h1 className={`headline-btn`}>
                                   {this.props.Lang.getWord("words")}
                                   <Link
                                       to={`${_path}/words/new`}
                                       className={`btn primary`}
                                   >
                                       {this.props.Lang.getWord("add_word")}
                                   </Link>
                               </h1>
                               <LanguageWordsPage />
                           </Route>
                       </Switch>
               </div>
          );

     }

}

const mapStateToProps = state => {
    return {
        Lang : state.lang
    }
}

export default connect(mapStateToProps)(LanguagesPage);