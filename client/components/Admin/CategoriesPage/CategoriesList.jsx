import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from "react-redux";

class CategoriesList extends ListPage {

     constructor(props) {
            super(props);

            this.containerExtraClasses = `column-list`;

            this.socketMessages = {
                refreshItems : `get categories page`,
                listenForRefresh : `refresh categories page`
            }
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
        addError : error => dispatch({type : "ADD_ERROR", error})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);