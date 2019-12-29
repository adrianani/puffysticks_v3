import React, { Component } from 'react';
import './SocialLinksPage.scss';
import AdminPage from "../AdminPage";
import {Route, Switch} from "react-router-dom";
import SocialLinksList from "./SocialLinksList";
import SocialLinkEditor from "./SocialLinkEditor";

const _path = '/admin/social-links';
class SocialLinksPage extends AdminPage {

     constructor(props) {
            super(props);
            
            this.state = {};

            this.pageKey = `social_links`;
     }
 
     render() {
     
          return (
                <Switch>
                    <Route exact path={`${_path}/edit/:linkId`}>
                        <SocialLinkEditor />
                    </Route>
                    <Route exact path={`${_path}/new`}>
                        <SocialLinkEditor />
                    </Route>
                    <Route exact path={_path}>
                        <SocialLinksList />
                    </Route>
                </Switch>
          );
      
     }
 
}

export default SocialLinksPage;