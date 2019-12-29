import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from "react-router-dom";
import FormInput from "../../Helpers/FormInput";

class SocialLinkEditor extends Component {

     constructor(props) {
            super(props);

            this.state = {
                socialLink : {
                    name : ``,
                    url : ``,
                    icon : ``
                }
            };
     }

     get title() {
         let {linkId} = this.props.match.params;
         if (!linkId) return this.props.Lang.getWord("add_social_link");
         return this.props.Lang.getWord("edit_social_link");
     }

     updateSocialLink = ({success, res, errors}) => {
         if (success) {
             this.setState({socialLink : res.socialLink});
             return;
         }
         this.props.addError(errors);
     }

     refreshSocialLink = () => {
         let {linkId} = this.props.match.params;
         if (!linkId) return;
         let {socket} = this.props;

         socket.emit(`get social link`, {linkId}, this.updateSocialLink);
     }

     componentDidMount() {
         this.refreshSocialLink();
     }

    updateSocialLinkField = (k, v) => {
         let {socialLink} = this.state;
         socialLink[k] = v;
         this.setState({socialLink});
     }

    handleResponse = ({success, errors}) => {
        if (success) {
            this.props.history.push("/admin/social-links");
        } else {
            this.props.addError(errors);
        }
    }

     submit = e => {
         e.preventDefault();
         let {socket} = this.props;
         let {linkId} = this.props.match.params;

         if (!linkId) {
             socket.emit(`post social link`, {socialLink : this.state.socialLink}, this.handleResponse);
             return;
         }

         socket.emit(`put social link`, {socialLink : this.state.socialLink}, this.handleResponse);
     }

     delete = () => {
         let {socket} = this.props;
         let {linkId} = this.props.match.params;

         if (!linkId) return;

         socket.emit(`delete social link`, {linkId}, this.handleResponse);
     }

     getDeleteBtn = () => {
         let {linkId} = this.props.match.params;
         if (!linkId) return null;

         return (
             <button
                 className={`btn`}
                 onClick={e => {
                     e.preventDefault();
                     this.props.addIrreversibleConfirmation({accept : this.delete});
                 }}
             >
                 {this.props.Lang.getWord('delete')}
             </button>
         );
     }

     render() {

          return (
               <div className={`Admin-inner-page`}>
                   <div className={`Admin-editor`}>
                       <h1>{this.title}</h1>

                       <form
                           onSubmit={this.submit}
                       >
                           <FormInput
                               label = {this.props.Lang.getWord('social_link_name')}
                               description={this.props.Lang.getWord('social_link_name_desc')}
                               value={this.state.socialLink.name}
                               onChange={v => this.updateSocialLinkField("name", v)}
                               darkTheme={true}
                           />
                           <FormInput
                               label = {this.props.Lang.getWord('social_link_url')}
                               description={this.props.Lang.getWord('social_link_url_desc')}
                               value={this.state.socialLink.url}
                               onChange={v => this.updateSocialLinkField("url", v)}
                               darkTheme={true}
                           />
                           <FormInput
                               label = {this.props.Lang.getWord('social_link_icon')}
                               description={(
                                   <>
                                       {this.props.Lang.getWord('social_link_icon_desc')}
                                       &nbsp;
                                       <span className={`icon-preview`}>
                                           <i className={`pufficon-${this.state.socialLink.icon}`} /> pufficon-{this.state.socialLink.icon}
                                       </span>
                                   </>
                               )}
                               value={this.state.socialLink.icon}
                               onChange={v => this.updateSocialLinkField("icon", v)}
                               darkTheme={true}
                           />

                           <div className={`btns-container`}>
                               <button
                                   className={`btn primary`}
                                   onClick={this.submit}
                               >
                                   {this.props.Lang.getWord('submit')}
                               </button>
                               {this.getDeleteBtn()}
                               <Link to={`/admin/social-links`} className={`empty btn`}>
                                   {this.props.Lang.getWord('cancel')}
                               </Link>
                           </div>
                       </form>
                   </div>
               </div>
          );

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SocialLinkEditor));