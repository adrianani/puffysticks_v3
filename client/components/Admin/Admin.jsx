import React, { Component } from 'react';
import './Admin.scss';
import {connect} from 'react-redux';
import AdminLogin from "./AdminLogin/AdminLogin";
import {Link, Route, Switch} from "react-router-dom";
import SideNavList from "../Helpers/SideNavList/SideNavList";
import LanguagesPage from "./LanguagesPage/LanguagesPage";
import AdminPage from "./AdminPage";

const _path = `/admin`;
class Admin extends Component {

     constructor(props) {
            super(props);
            
            this.state = {
                selectedNavItem : ``
            };

            this.navItems = [
                {
                    title : `languages`,
                    key : `languages`,
                    url : `${_path}/languages`
                },
                {
                    title : `gallery`,
                    key : `gallery`,
                    url : `${_path}/gallery`
                },
                {
                    title : `social_links`,
                    key : `social_links`,
                    url : `${_path}/social-links`
                },
                {
                    title : `categories`,
                    key : `categories`,
                    url : `${_path}/categories`
                },
                {
                    title : `articles`,
                    key : `articles`,
                    url : `${_path}/articles`
                },
            ];
     }

     selectNavItem = selectedNavItem => {
         this.setState({selectedNavItem});
     }

     getContent = () => {
         let {client} = this.props;

         if (!client.isLogged()) {
             return (
                 <AdminLogin />
             );
         }

         return (
             <div className={`main-wrap-2-col`}>
                 <div className={`main-wrap-col`}>
                     <div className={`main-logo pufficon-logo`}/>
                     <h1>admin dashboard</h1>
                     <SideNavList
                         title = {"settings"}
                         navItems = {this.navItems}
                         selectedNavItem = {this.state.selectedNavItem}
                     />
                     <div className={`admin-footer`}>
                         <div className={`user-details`}>
                             <p className={`logged-in-msg`}>logged in as</p>
                             <p className={`user-name`}>
                                 {client.name}
                                 <button
                                     className={`empty btn pufficon-logout`}
                                     onClick={client.logout}
                                 />
                             </p>
                         </div>
                         <Link to={`/`} className={`btn`}>back to website</Link>
                     </div>
                 </div>
                 <div className={`main-wrap-col`}>
                     <Switch>
                         <Route path={`${_path}/languages`}>
                             <LanguagesPage setPageKey={this.selectNavItem} />
                         </Route>
                         <Route path={`${_path}/gallery`}>
                             <AdminPage pageKey={`gallery`} key={`gallery`} setPageKey={this.selectNavItem} />
                         </Route>
                         <Route path={`${_path}/social-links`}>
                             <AdminPage pageKey={`social_links`} key={`social_links`} setPageKey={this.selectNavItem} />
                         </Route>
                         <Route path={`${_path}/categories`}>
                             <AdminPage pageKey={`categories`} key={`categories`} setPageKey={this.selectNavItem} />
                         </Route>
                         <Route path={`${_path}/articles`}>
                             <AdminPage pageKey={`articles`} key={`articles`} setPageKey={this.selectNavItem} />
                         </Route>
                     </Switch>
                 </div>
             </div>
         );
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