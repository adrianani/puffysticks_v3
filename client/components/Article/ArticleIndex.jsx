import React, { Component } from 'react';
import './ArticleIndex.scss';
import InfiniteScroll from 'react-infinite-scroller';
import LazyLoad from "react-lazyload";
import Util from "../../classes/Util";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";

class ArticleIndex extends Component {

     constructor(props) {
            super(props);

            this.state = {
                items : [],
                count : 0
            };

            this.itemsPerPage = 20;
     }

     componentDidMount() {
         this.refreshItems(1);
     }

    pushItems = ({success, res, errors}) => {
         if (!success) {
             this.props.addError(errors);
             return;
         }

         console.log({success, res, errors});

         this.setState({items : [...this.state.items, ...res.items], count : res.count})
     }

     refreshItems = (page) => {
         console.log({page});
         page--;

         this.props.socket.emit(`get articles page by category slug`, {
             categorySlug : this.props.match.params.categorySlug,
             itemsPerPage : this.itemsPerPage,
             page,
             langId : this.props.Lang.langId
         }, this.pushItems);
     }

     showItem = item => {
         return (
             <LazyLoad
                 key={item.slug}
                 scrollContainer={".Article-Index"}
                 placeholder={(
                     <div
                         className={`article-index-item`}
                     />
                 )}
             >
                 <div
                     className={`article-index-item`}
                     style={{backgroundImage : `url(/${Util.getArticleImage(item.thumbnail)})`}}
                 >
                     <span>{item.title}</span>
                 </div>
             </LazyLoad>
         );
     }

    render() {
         let {items} = this.state;

          return (
               <div className={`Article-Index`} style={{height: `100%`, overflow: `auto`}} ref={(ref) => this.scrollParentRef = ref}>
                   <InfiniteScroll
                       pageStart={0}
                       loadMore={this.refreshItems}
                       hasMore={(this.state.count < items.length)}
                       loader={<div className="loader" key={0}>Loading ...</div>}
                       useWindow={false}
                       getScrollParent={() => this.scrollParentRef}
                   >
                       {items.map(item => this.showItem(item))}
                   </InfiniteScroll>
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
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArticleIndex));