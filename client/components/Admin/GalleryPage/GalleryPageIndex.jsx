import React, { Component } from 'react';
import {connect} from 'react-redux';
import GalleryList from "./GalleryList";
import GalleryUploader from "../../Helpers/GalleryUploader/GalleryUploader";

class GalleryPageIndex extends Component {

     constructor(props) {
            super(props);

            this.state = {};
     }

     render() {

          return (
               <div className={`Admin-inner-page GalleryPage`}>
                   <h1 className={`headline-btn`}>
                       {this.props.Lang.getWord("gallery")}
                   </h1>
                   <GalleryUploader />
                   <GalleryList />
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

export default connect(mapStateToProps)(GalleryPageIndex);