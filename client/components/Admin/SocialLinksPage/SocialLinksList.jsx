import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Link} from "react-router-dom";

const _path = "/admin/social-links";
class SocialLinksList extends Component {

     constructor(props) {
            super(props);

            this.state = {
                socialLinks : []
            };
     }

     updateSocialLinks = ({success, res, errors}) => {
         if (success) {
             this.setState({socialLinks : res.socialLinks});
             return;
         }

         this.props.addError(errors);
     }

     refreshSocialLinks = () => {
         let {socket} = this.props;

         socket.emit(`get social links`, this.updateSocialLinks);
     }

    handleResponse = ({success, errors}) => {
        if (!success) {
            this.props.addError(errors);
        }
    }

     delete = linkId => {
         this.props.socket.emit(`delete social link`, {linkId}, this.handleResponse);
     }

     getContent = () => {
         let {socialLinks} = this.state;

         if (!socialLinks.length) {
             return (
                 <h2 className={`no-items`}>
                     {this.props.Lang.getWord("social_links_not_found")}
                 </h2>
             );
         }

         return socialLinks.map(socialLink => {
             return (
                 <li
                     className={`social-link-list-item`}
                     key={socialLink._id}
                 >
                     <div className={`info`}>
                         <i className={`pufficon-${socialLink.icon}`} />
                         <div className={`name-link`}>
                             <p className={`name`}>
                                 {socialLink.name}
                             </p>
                             <Link to={socialLink.url} target={`_blank`}>
                                 {socialLink.url} 
                             </Link>
                         </div>
                     </div>
                     <div className={`btns-container`}>
                         <Link
                             to={`${_path}/edit/${socialLink._id}`}
                             className={`btn with-icon`}
                         >
                             <i className={`pufficon-settings`} />
                             {this.props.Lang.getWord("edit")}
                         </Link>
                         <button
                             className={`btn with-icon`}
                             onClick={e => {
                                 e.preventDefault();
                                 this.props.addIrreversibleConfirmation({accept : () => this.delete(socialLink._id)});
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

     componentDidMount() {
         this.refreshSocialLinks();
         this.props.socket.on(`refresh social links`, this.refreshSocialLinks);
     }

     componentWillUnmount() {
         this.props.socket.off(`refresh social links`);
     }

    render() {

          return (
              <div className={`Admin-inner-page Social-links-page`}>
                  <h1 className={`headline-btn`}>
                      {this.props.Lang.getWord("social_links")}
                      <a
                          href={`${_path}/new`}
                          className={`btn primary`}
                          target={`_blank`}
                      >
                          {this.props.Lang.getWord("add_social_link")}
                      </a>
                  </h1>

                  <div className={`List-page column-list`}>
                      <ul className={`list-container`}>
                          {this.getContent()}
                      </ul>
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

export default connect(mapStateToProps, mapDispatchToProps)(SocialLinksList);