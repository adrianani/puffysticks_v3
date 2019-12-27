import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

class LanguageEditor extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

          return (
               <div>

               </div>
          );

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LanguageEditor));