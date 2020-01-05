import React, { Component } from 'react';
import './Index.scss';
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import Footer from "../Footer/Footer";
import ArticleIndex from "../Article/ArticleIndex";

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
         let {categorySlug} = this.props.match.params;
         let allSelected = categorySlug === undefined ? `selected` : ``;
         return [
             (<li key={'all'}>
                 <Link to={`/`} className={allSelected}>
                     {this.props.Lang.getWord("all")}
                 </Link>
             </li>),
             ...categories.map((category) => {
                 let selected = category.slug === categorySlug ? `selected` : ``
                 return (<li key={category._id}>
                     <Link to={`/cat/${category.slug}`} className={selected}>
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
                    <Link to={`/`} className={`main-logo pufficon-logo`} />
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
                        <ul className={`Side-Nav-List categories-list`}>
                            {this.getCategories()}
                        </ul>
                    </div>

                    <Footer/>
                </div>

                   <div className={`main-wrap-col`} ref={r => this.mainColumnRef = r}>
                       <ArticleIndex mainColumnRef = {this.mainColumnRef}/>
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