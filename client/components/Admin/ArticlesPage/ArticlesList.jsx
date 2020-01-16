import React, { Component } from 'react';
import ListPage from "../../Helpers/ListPage/ListPage";
import {connect} from "react-redux";
import LazyLoad from 'react-lazyload';
import Util from "../../../classes/Util";
import {Link} from "react-router-dom";

const _path = `/admin/articles`;
class ArticlesList extends ListPage {

     constructor(props) {
            super(props);

            this.socketMessages = {
                refreshItems : `get articles page`,
                listenForRefresh : `refresh articles page`
            }


     }

     handleResponse = ({success, errors}) => {
         if (!success) {
             this.props.addError(errors);
         }
     }

     deleteArticle = articleId => {
         this.props.socket.emit(`delete article`, {articleId}, this.handleResponse);
     }

     getListContent = () => {
         let {items} = this.state;

         return items.map(article => {
             console.log({article});
             return (
                 <li
                     key={article._id}
                     className={`article-list-item`}
                 >
                     <LazyLoad
                         scrollContainer={".Admin-page .main-wrap-2-col .main-wrap-col:nth-child(2)"}
                         placeholder={(
                             <div
                                 className={`article-thumbnail`}
                                 style={{backgroundImage : `url(/${Util.getArticleImage(article.thumbnail, "blurred")})`}}
                             />
                         )}
                     >
                         <div
                             className={`article-thumbnail`}
                             style={{backgroundImage : `url(/${Util.getArticleImage(article.thumbnail)})`}}
                         />
                     </LazyLoad>
                     <p className={`posted`}>{Util.formatDate(article.posted, true)}</p>
                     <p
                         className={`title`}
                         title={article.title}
                     >{article.title}
                     </p>

                     <div className={`btns-container`}>
                         <Link
                             to={`/article/${article.slug}`}
                             className={`btn`}
                         >
                             <i className={`pufficon-arrow`} />
                         </Link>
                         <Link
                             to={`${_path}/edit/${article._id}`}
                             className={`btn`}
                         >
                             <i className={`pufficon-settings`} />
                         </Link>
                         <button
                             className={`btn`}
                             onClick={e => {
                                 e.preventDefault();
                                 this.props.addIrreversibleConfirmation({accept : this.deleteArticle(article._id)});
                             }}
                         >
                             <i className={`pufficon-trash`} />
                         </button>
                     </div>
                 </li>
             );
         });
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

export default connect(mapStateToProps, mapDispatchToProps)(ArticlesList);