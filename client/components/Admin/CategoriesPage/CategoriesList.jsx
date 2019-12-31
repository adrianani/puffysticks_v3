import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from "react-redux";
import {Link} from "react-router-dom";

const _path = `/admin/categories`;
class CategoriesList extends ListPage {

     constructor(props) {
            super(props);

            this.containerExtraClasses = `column-list`;

            this.socketMessages = {
                refreshItems : `get categories page`,
                listenForRefresh : `refresh categories page`
            }
     }

    delete = categoryId => {
        this.socket.emit(`delete category`, {categoryId}, this.handleResponse);
    }

     getListContent = () => {
         let {items} = this.state;

         return items.map(category => {
            return (
                <li className={`category-list-item`} key={category._id}>
                    <span className={`title`}>
                        {this.props.Lang.getWord("category_title_" + category._id)}
                    </span>
                    <div className={`btns-container`}>
                        <Link
                            to={`${_path}/edit/${category._id}`}
                            className={`btn with-icon`}
                        >
                            <i className={`pufficon-settings`} />
                            {this.props.Lang.getWord("edit")}
                        </Link>
                        <button
                            className={`btn with-icon`}
                            onClick={e => {
                                e.preventDefault();
                                this.props.addIrreversibleConfirmation({accept : () => this.delete(category._id)});
                            }}
                        >
                            <i className={`pufficon-trash`} />
                            {this.props.Lang.getWord("delete")}
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);