import React, { Component } from 'react';
import {connect} from 'react-redux'
import ListPage from "../../Helpers/ListPage/ListPage";
import {Link} from "react-router-dom";

class WordsList extends ListPage {

     constructor(props) {
            super(props);

            this.socketMessages = {
                refreshItems : `get lang words page`
            }

            this.itemsPerPage = 7;
            this.containerExtraClasses = `column-list`;
     }

     getListContent = () => {
         let {items} = this.state;

         return items.map(item => {
            return (
                <li key={item._id} className={`lang-words-list-item`}>
                    <div className={`details`}>
                        <p className={`key`}>{item.key}</p>
                        <p className={`string`}>{item.string}</p>
                    </div>
                    <Link
                        to={`/admin/languages/words/edit/${item._id}`}
                        className={`btn with-icon`}
                    >
                        <i className={`pufficon-settings`}/> edit
                    </Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(WordsList);