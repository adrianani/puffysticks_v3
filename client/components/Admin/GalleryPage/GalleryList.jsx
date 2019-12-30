import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from "react-redux";

class GalleryList extends ListPage {

     constructor(props) {
            super(props);

            this.socketMessages = {
                refreshItems : `get gallery page`,
                listenForRefresh : `refresh gallery page`
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

export default connect(mapStateToProps, mapDispatchToProps)(GalleryList);