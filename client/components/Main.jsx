import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

import '../assets/icons/pufficon.scss';
import './Main.scss';

import Debug from "./Debug/Debug";
import Admin from "./Admin/Admin";
import ErrorMessages from "./Helpers/ErrorMessages/ErrorMessages";

class Main extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

          return (
               <Router>
                   <ErrorMessages />
                   <Switch>
                       <Route path={`/debug`}>
                           <Debug />
                       </Route>
                       <Route path={`/admin`}>
                           <Admin />
                       </Route>
                   </Switch>
               </Router>
          );

     }

}

export default Main;