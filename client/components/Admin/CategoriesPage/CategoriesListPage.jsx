import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Link} from "react-router-dom";
import CategoriesList from "./CategoriesList";
import WordsList from "../LanguagesPage/WordsList";

const _path = `/admin/categories`;
class CategoriesListPage extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

          return (
               <div className={`Admin-inner-page Categories-page`}>
                   <h1 className={`headline-btn`}>
                       {this.props.Lang.getWord("categories")}
                       <Link
                           to={`${_path}/new`}
                           className={`btn primary`}
                       >
                           {this.props.Lang.getWord("add_category")}
                       </Link>
                   </h1>/
                   <CategoriesList
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

export default connect(mapStateToProps)(CategoriesListPage);