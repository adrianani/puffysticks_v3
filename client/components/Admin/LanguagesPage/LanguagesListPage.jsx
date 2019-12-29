import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from 'react-redux'
import {Link} from "react-router-dom";

class LanguagesListPage extends ListPage {

     constructor(props) {
            super(props);

            this.containerExtraClasses = `column-list`;
            this._includeSearchbar = false;

             this.socketMessages = {
                 refreshItems : `get lang page`,
                 listenForRefresh : `refresh lang page`
             }
     }

     duplicateLang = langId => {
         let {socket} = this.props;

         socket.emit(`duplicate language`, {langid : langId}, ({success, errors}) => {
            if (!success) {
                this.props.addError(errors);
            }
         });
     }

     deleteLang = langId => {
         let {socket} = this.props;

         socket.emit(`delete language`, {langid : langId}, ({success, errors}) => {
            if (!success) {
                this.props.addError(errors);
            }
         });
     }

     getListContent = () => {
         let {items} = this.state;

         return items.map(item => {
             let defaultComp = null;
             if (item.default) {
                 defaultComp = (<span className={`default no-select`}>{this.props.Lang.getWord("default")}</span>);
             }
            return (
                <li className={`language-list-item`} key={item._id}>
                    <div className={`details`}>
                        <span className={`shortcut`}>{item.shortcut}</span>
                        <span className={`name`}>{item.name}</span>
                        {defaultComp}
                    </div>
                    <div className={`btns-container`}>
                        <button
                            className={`btn with-icon`}
                            onClick = {() => this.duplicateLang(item._id)}
                        >
                            <i className={`pufficon-copy`}/> {this.props.Lang.getWord("duplicate")}
                        </button>
                        <Link
                            to={`/admin/languages/edit/${item._id}`}
                            className={`btn with-icon`}
                        >
                            <i className={`pufficon-settings`}/> {this.props.Lang.getWord("edit")}
                        </Link>
                        <button
                            className={`btn with-icon`}
                            onClick={e => {
                                e.preventDefault();
                                this.props.addIrreversibleConfirmation({accept : () => this.deleteLang(item._id)});
                            }}
                        >
                            <i className={`pufficon-trash`}/> {this.props.Lang.getWord("delete")}
                        </button>
                    </div>
                </li>
            );
         });
     }

}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        Lang : state.lang
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error}),
        addIrreversibleConfirmation : (funcs) => dispatch({type : "ADD_IRREVERSIBLE_CONFIRMATION", ...funcs})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguagesListPage);