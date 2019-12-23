import React, { Component } from 'react';
import './Admin.scss';
import {connect} from 'react-redux';
import AdminLogin from "./AdminLogin/AdminLogin";

class Admin extends Component {

     constructor(props) {
            super(props);
            
            this.state = {};
     }

     getContent = () => {
         let {client} = this.props;
         console.log({client});

         if (!client.isLogged()) {
             return (
                 <AdminLogin />
             );
         }

         return null;
     }
 
     render() {
     
          return (
               <div className={`Admin-page`}>
                   {this.getContent()}
               </div>
          );
      
     }
 
}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        client : state.client
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);