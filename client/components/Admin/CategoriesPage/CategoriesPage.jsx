import React, { Component } from 'react';
import './CategoriesPage.scss';
import AdminPage from "../AdminPage";
import {Route, Switch} from "react-router-dom";
import CategoriesListPage from "./CategoriesListPage";
import CategoryEditor from "./CategoryEditor";

const _path = `/admin/categories`;
class CategoriesPage extends AdminPage {

     constructor(props) {
            super(props);

            this.state = {};

            this.pageKey = `categories`;
     }

     render() {

          return (
               <Switch>
                   <Route exact path={`${_path}/edit/:categoryId`}>
                       <CategoryEditor />
                   </Route>
                   <Route exact path={`${_path}/new`}>
                       <CategoryEditor />
                   </Route>
                   <Route exact path={_path}>
                       <CategoriesListPage />
                   </Route>
               </Switch>
          );

     }

}

export default CategoriesPage;