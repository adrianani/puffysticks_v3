import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from 'react-redux'
import {Link} from "react-router-dom";

class LanguagesListPage extends ListPage {

     constructor(props) {
            super(props);

            this.state.items = [
            ];

            this.containerExtraClasses = `column-list`;
            this._includeSearchbar = false;

             this.socketMessages = {
                 refreshItems : `get lang page`,
                 listenForRefresh : `refresh lang page`
             }
     }

     getListContent = () => {
         let {items} = this.state;

         return items.map(item => {
             let defaultComp = null;
             if (item.default) {
                 defaultComp = (<span className={`default no-select`}>default</span>);
             }
            return (
                <li className={`language-list-item`}>
                    <div className={`details`}>
                        <span className={`shortcut`}>{item.shortcut}</span>
                        <span className={`name`}>{item.name}</span>
                        {defaultComp}
                    </div>
                    <div className={`btns-container`}>
                        <button
                            className={`btn with-icon`}
                        >
                            <i className={`pufficon-copy`}/> duplicate
                        </button>
                        <Link
                            to={`/admin/languages/edit/${item._id}`}
                            className={`btn with-icon`}
                        >
                            <i className={`pufficon-settings`}/> edit
                        </Link>
                        <button
                            className={`btn with-icon`}
                        >
                            <i className={`pufficon-trash`}/> delete
                        </button>
                    </div>
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