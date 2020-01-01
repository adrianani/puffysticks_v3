import React, { Component } from 'react';
import './Index.scss';
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import Footer from "../Footer/Footer";

class Index extends Component {

     constructor(props) {
            super(props);
            
            this.state = {
                socialLinks : [],
                categories : [],
            };
     }

     updateCategories = ({success, res, errors}) => {
         if (success) {
             this.setState({categories : res.categories});
         } else {
             this.props.addError(errors);
         }
     }

     refreshCategories = () => {
         this.props.socket.emit(`get all categories`, this.updateCategories);
     }

     updateSocialLinks = ({success, res, errors}) => {
         if (success) {
             this.setState({socialLinks : res.socialLinks});
         } else {
             this.props.addError(errors);
         }
     }

     refreshSocialLinks = () => {
         this.props.socket.emit(`get social links`, this.updateSocialLinks);
     }

     componentDidMount() {
         this.refreshCategories();
         this.refreshSocialLinks();
     }

     getSocialLinks = () => {
         let {socialLinks} = this.state;

         return socialLinks.map(link => {
             return (
                 <a
                     href={link.url}
                     key={link._id}
                     target={`_blank`}
                     className={`pufficon-${link.icon}`}
                 />
             );
         })
     }

     getCategories = () => {
         let {categories} = this.state;
         let {categoryId} = this.props.match.params;
         let allSelected = categoryId === undefined ? `selected` : ``;
         return [
             (<li key={'all'}>
                 <Link to={`/`} className={allSelected}>
                     {this.props.Lang.getWord("all")}
                 </Link>
             </li>),
             ...categories.map((category) => {
                 let selected = category._id === categoryId ? `selected` : ``
                 return (<li key={category._id}>
                     <Link to={`/cat/${category._id}`} className={selected}>
                         {this.props.Lang.getWord(`category_title_${category._id}`)}
                     </Link>
                 </li>);
             })
         ]
     }

    render() {
     
          return (
              <div className={`Index-page`}>
               <div className={`main-wrap-2-col`}>
                <div className={`main-wrap-col`}>
                    <div className={`main-logo pufficon-logo`} />
                    <h1>
                        {this.props.Lang.getWord("main_headline")}
                    </h1>
                    <div className={`side-container`}>
                        <h4>{this.props.Lang.getWord("get_in_touch")}</h4>
                        <div className={`social-links`}>
                            {this.getSocialLinks()}
                        </div>
                    </div>
                    <div className={`side-container`}>
                        <h4>{this.props.Lang.getWord("categories")}</h4>
                        <ul className={`Side-Nav-List`}>
                            {this.getCategories()}
                        </ul>
                    </div>

                    <Footer/>
                </div>
               </div>
              </div>
          );
      
     }
 
}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        client : state.client,
        Lang : state.lang
    }
}

const mapDispatchToProps = dispatch => {
    return {
        addError : error => dispatch({type : "ADD_ERROR", error})
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Index));