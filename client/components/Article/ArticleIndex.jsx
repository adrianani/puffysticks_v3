import React, { Component } from 'react';
import './ArticleIndex.scss';
import $ from 'jquery';
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
                count : true
            };

            this.itemsPerPage = 20;
     }

     pushItems = ({success, res, errors}) => {
         if (!success) {
             this.props.addError(errors);
             return;
         }

         this.setState({items : [...this.state.items, ...res.items], count : res.count})
     }

     refreshItems = (page) => {
         console.log({page});
         page--;

         // setTimeout(() => {
         //     let newItems = [];
         //     for (let i = 0; i < this.itemsPerPage; ++i) {
         //         newItems.push({
         //             key : page * this.itemsPerPage + i + 1,
         //             title : `Title no. ${page * this.itemsPerPage + i + 1} goes here`,
         //             thumbnail : `/imgs/5e122763ea2213395068a556.png`
         //         });
         //     }
         //     this.setState({items : [...this.state.items, ...newItems]});
         // }, 2000);

         this.props.socket.emit(`get articles page by category slug`, {
             categorySlug : this.props.match.params.categorySlug,
             itemsPerPage : this.itemsPerPage,
             page,
             langId : this.props.Lang.langId
         }, this.pushItems);
     }

     showItem = item => {
         return null;
         return (
             <LazyLoad
                 key={item.key}
                 scrollContainer={".Article-Index"}
                 placeholder={(
                     <div
                         className={`article-index-item`}
                     />
                 )}
             >
                 <div
                     className={`article-index-item`}
                     style={{backgroundImage : `url(${item.thumbnail})`}}
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