import React, { Component } from 'react';
import './AdminLogin.scss';
import FormInput from "../../Helpers/FormInput";
import {Link} from "react-router-dom";
import {connect} from 'react-redux';

class AdminLogin extends Component {

     constructor(props) {
            super(props);
            
            this.state = {
                name : ``,
                password : ``
            };
     }

     updateField = (k, v) => {
         this.setState({[k] : v});
     }

     handleResponse = ({success, res, errors}) => {
         if (!success) {
             this.props.addError(errors);
             return;
         }

         let {client} = this.props;
         client.login({userId : res.id, userHash : res.hash});
     }

     submit = e => {
         e.preventDefault();
         let {name, password} = this.state;
         let {socket} = this.props;

         socket.emit(`login with name and password`, {name, password}, this.handleResponse);
     }
 
     render() {
     
          return (
               <div className={`Admin-login-page`}>
                    <div className={`main-wrap`}>
                        <div className={`logo pufficon-logo`} />
                        <h1>Log in with your admin credentials</h1>

                        <form onSubmit = {this.submit}>
                            <FormInput
                                label={`username`}
                                type={`text`}
                                value={this.state.name}
                                onChange={(v) => this.updateField('name', v)}
                                placeholder={`hi! my name is...`}
                            />
                            <FormInput
                                label={`password`}
                                type={`password`}
                                value={this.state.password}
                                onChange={(v) => this.updateField('password', v)}
                                placeholder={`type it in here. i won't look`}
                            />

                            <div className={`btns-container`}>
                                <button className={`btn primary`}>
                                    login
                                </button>
                                <span className={`btn-sep`}>or</span>
                                <Link
                                    to={`/`}
                                    className={`empty btn`}
                                >go back</Link>
                            </div>
                        </form>
                    </div>
               </div>
          );
      
     }
 
}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        client : state.client
    }
};

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLogin);