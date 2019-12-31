import React, { Component } from 'react';
import {connect} from 'react-redux';
import ArticlesList from "./ArticlesList";
import GalleryUploader from "../../Helpers/GalleryUploader/GalleryUploader";
import {Link} from "react-router-dom";
import CategoriesList from "../CategoriesPage/CategoriesList";

const _path = `/admin/articles`;
class ArticlesPageIndex extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

          return (
               <div className={`Admin-inner-page GalleryPage`}>
                   <h1 className={`headline-btn`}>
                       {this.props.Lang.getWord("articles")}
                       <Link
                           to={`${_path}/new`}
                           className={`btn primary`}
                       >
                           {this.props.Lang.getWord("add_article")}
                       </Link>
                   </h1>
                   <ArticlesList
                       key={"lang" + this.props.Lang.langId}
                       moreOptions={{selectedLanguage : this.props.Lang.langId}}
                   />
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

export default connect(mapStateToProps)(ArticlesPageIndex);