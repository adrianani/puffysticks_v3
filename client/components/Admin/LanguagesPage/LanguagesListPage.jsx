import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from 'react-redux'
import {Link} from "react-router-dom";

class LanguagesListPage extends ListPage {

     constructor(props) {
            super(props);

            this.state.items = [
                {
                    _id : '12',
                    default : true,
                    shortcut : "en",
                    name : "english"
                },
                {
                    _id : '13',
                    default : false,
                    shortcut : "ro",
                    name : "română"
                }
            ];

            this.containerExtraClasses = `column-list`;
            this._includeSearchbar = false;

             this.socketMessages = {
                 refreshItems : `get lang page`
             }
     }

     getListContent = () => {
         let {items} = this.state;

         return items.map(item => {
             let defaultComp = null;
             if (item.default) {
                 defaultComp = (<span className={`default`}>default</span>);
             }
            return (
                <li className={`language-list-item`}>
                    <div className={`details`}>
                        <span className={`shortcut`}>{item.shortcut}</span>
                        <span className={`name`}>{item.name}</span>
                        {defaultComp}
                    </div>
                    <Link 
                        to={`/admin/languages/edit/${item._id}`}
                        className={`btn with-icon`}
                    ><i className={`pufficon-settings`}/> edit</Link>
                </li>
            );
         });
     }

}

const mapStateToProps = state => {
    return {
        socket : state.socket
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguagesListPage);