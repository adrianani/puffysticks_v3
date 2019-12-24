import React, { Component } from 'react';
import './LanguagesPage.scss';
import AdminPage from "../AdminPage";
import LanguagesListPage from "./LanguagesListPage";
import {Link, Route, Switch} from "react-router-dom";

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
                    <Link to={item.url} className={selected}>{item.title}</Link>
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

                   <div className={`main-container`}>
                       <Switch>
                           <Route exact path={_path}>
                               {this.getHorizontalNav('languages')}
                               <h1 className={`headline-btn`}>
                                   languages
                                   <button className={`btn primary`}>add language</button>
                               </h1>
                               <LanguagesListPage />
                           </Route>
                           <Route exact path={`${_path}/words`}>
                               {this.getHorizontalNav('words')}
                               <h1 className={`headline-btn`}>
                                   words
                                   <button className={`btn primary`}>add word</button>
                               </h1>
                           </Route>
                       </Switch>
                   </div>
               </div>
          );

     }

}

export default LanguagesPage;