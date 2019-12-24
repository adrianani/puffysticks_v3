import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from 'react-redux'

class LanguagesListPage extends ListPage {

     constructor(props) {
            super(props);

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