import React, { Component } from 'react';
import './ModalMessages.scss';
import {connect} from 'react-redux';
import ModalMessage from "./ModalMessage";

class ModalMessages extends Component {

     constructor(props) {
            super(props);
            
            this.state = {};
     }

     get message () {
         let {modalMessages} = this.props;
         let msg = modalMessages[modalMessages.length - 1];
         return (
             <ModalMessage key={msg.id} message={msg} />
         );
     }
 
     render() {
         let {modalMessages} = this.props;

         if(!modalMessages || !modalMessages.length) return null;
     
          return (
               <div className={`Modal-messages-container`}>
                   {this.message}
               </div>
          );
      
     }
 
}

const mapStateToProps = state => {
    return {
        modalMessages : state.modalMessages
    }
}

export default connect(mapStateToProps)(ModalMessages);