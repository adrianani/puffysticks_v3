import React, { Component } from 'react';
import './ArticlesPage.scss';
import AdminPage from "../AdminPage";
import {Route, Switch} from "react-router-dom";
import ArticlesPageIndex from "./ArticlesPageIndex";
import ArticleEditor from "./ArticleEditor";

const _path = `/admin/articles`;
class ArticlesPage extends AdminPage {

     constructor(props) {
            super(props);

            this.state = {};

            this.pageKey = 'articles';
     }

     render() {

          return (
               <Switch>
                   <Route exact path={`${_path}/edit/:articleId`}>
                       <ArticleEditor />
                   </Route>
                   <Route exact path={`${_path}/new`}>
                       <ArticleEditor />
                   </Route>
                   <Route exact path={_path}>
                       <ArticlesPageIndex />
                   </Route>
               </Switch>
          );

     }

}

export default ArticlesPage;