import React, { Component } from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import './Main.scss';
import Debug from "./Debug/Debug";

class Main extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

          return (
               <Router>
                   <Switch>
                       <Route path={`/debug`}>
                           <Debug />
                       </Route>
                   </Switch>
               </Router>
          );

     }

}

export default Main;