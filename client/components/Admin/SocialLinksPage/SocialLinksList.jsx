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

     getContent = () => {
         let {socialLinks} = this.state;

         if (!socialLinks.length) {
             return (
                 <h2 className={`no-items`}>
                     {this.props.Lang.getWord("social_links_not_found")}
                 </h2>
             );
         }
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
                      <Link
                          to={`${_path}/new`}
                          className={`btn primary`}
                      >
                          {this.props.Lang.getWord("add_social_link")}
                      </Link>
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

export default connect(mapStateToProps)(SocialLinksList);