import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import {connect} from 'react-redux';

import '../assets/icons/pufficon.scss';
import './Main.scss';

import Debug from "./Debug/Debug";
import Admin from "./Admin/Admin";
import ErrorMessages from "./Helpers/ErrorMessages/ErrorMessages";
import ModalMessages from "./Helpers/ModalMessages/ModalMessages";
import Index from "./Index";
import ArticlePage from "./ArticlePage/ArticlePage";

class Main extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {
         if (!this.props.Lang.loaded) return null;

          return (
               <Router>
                   <ModalMessages />
                   <ErrorMessages />
                   <Switch>
                       <Route path={`/debug`}>
                           <Debug />
                       </Route>
                       <Route path={`/admin`}>
                           <Admin />
                       </Route>
                       <Route path={`/article/:articleSlug`}>
                           <ArticlePage />
                       </Route>
                       <Route exact path={`/category/:categorySlug-:categoryName`}>
                           <Index />
                       </Route>
                       <Route path={`/`}>
                           <Index />
                       </Route>
                   </Switch>
               </Router>
          );

     }

}

const mapStateToProps = state => {
    return {
        Lang : state.lang
    }
}

export default connect(mapStateToProps)(Main);