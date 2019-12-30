import React, { Component } from 'react';
import './GalleryPage.scss';
import AdminPage from "../AdminPage";
import {Route, Switch} from "react-router-dom";
import GalleryPageIndex from "./GalleryPageIndex";

const _path = `/admin/gallery`;
class GalleryPage extends AdminPage {

     constructor(props) {
            super(props);

            this.state = {};

            this.pageKey = 'gallery';
     }

     render() {

          return (
               <Switch>
                   <Route exact path={_path}>
                       <GalleryPageIndex />
                   </Route>
               </Switch>
          );

     }

}

export default GalleryPage;