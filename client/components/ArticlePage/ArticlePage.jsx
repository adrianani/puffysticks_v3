import React, { Component } from 'react';
import './ArticlePage.scss';
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import Footer from "../Footer/Footer";
import ArticleIndex from "../Article/ArticleIndex";

class ArticlePage extends Component {

     constructor(props) {
            super(props);

            this.state = {
                article : null
            };
     }

     updateArticle = ({success, res, errors}) => {
         console.log({success, res, errors});

         if (!success) {
             this.props.addError(errors);
         }
     }

     refreshArticle = () => {
         let {articleSlug} = this.props.match.params;

         this.props.socket.emit(`get article by slug`, {
            articleSlug,
            langId : this.props.Lang.langId
         }, this.updateArticle);
     }

     componentDidMount() {
         this.refreshArticle();
     }

    getAdminBtn = () => {
        if (!this.props.client.isLogged()) return null;

        return (
            <Link to={`/admin`} className={`pufficon-settings acp-btn`} />
        );
    }

     render() {

          return (
              <div className={`Article-page`}>
                  <div className={`main-wrap-2-col`}>
                      <div className={`main-wrap-col`}>
                          <div className={`main-logo-wrap`}>
                              <Link to={`/`} className={`main-logo pufficon-logo`} />

                              {this.getAdminBtn()}
                          </div>
                          <h1>
                              {this.props.Lang.getWord("main_headline")}
                          </h1>

                          <Footer/>
                      </div>

                      <div className={`main-wrap-col`}>

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ArticlePage));