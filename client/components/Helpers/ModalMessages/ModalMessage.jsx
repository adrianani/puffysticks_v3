import React, { Component } from 'react';
import {connect} from 'react-redux';

class ModalMessage extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     accept = e => {
         e.preventDefault();
         let accept = this.props.message.accept || (() => {});
         accept();
         this.props.removeModalMessage(this.props.message.id);
     }

     reject = e => {
         e.preventDefault();
         let reject= this.props.message.reject || (() => {});
         reject();
         this.props.removeModalMessage(this.props.message.id);
     }

     render() {
         let {message} = this.props;

          return (
               <div className={`Modal-message`}>
                   <h2>{this.props.Lang.getWord(`${message.type}_headline`)}</h2>
                   <p>
                       {this.props.Lang.getWord(`${message.type}_message`)}
                   </p>
                   <div className={`btns-container`}>
                       <button
                           className={`btn primary`}
                           onClick={this.accept}
                       >
                           {this.props.Lang.getWord(`${message.type}_accept`)}
                       </button>
                       <span className={`btn-sep`}>
                           {this.props.Lang.getWord(`or`)}
                       </span>
                       <button
                           className={`empty btn`}
                           onClick={this.reject}
                       >
                           {this.props.Lang.getWord(`${message.type}_reject`)}
                       </button>
                   </div>
               </div>
          );

     }

}

const mapStateToProps = state => {
    return {
        Lang : state.lang
    }
}

const mapDispatchToProps = dispatch => {
    return {
        removeModalMessage : (id) => dispatch({type: 'REMOVE_MODAL_MESSAGE', id})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalMessage);