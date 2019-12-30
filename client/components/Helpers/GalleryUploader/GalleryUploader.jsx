import React, { Component } from 'react';
import './GalleryUploader.scss';

class GalleryUploader extends Component {

     constructor(props) {
            super(props);
            
            this.state = {};
     }

     handleOnChange = e => {
         console.log(e.target.files);
         let fl = e.target.files;
         let fr = new FileReader();
         fr.onload = e => console.log({e});
         fr.readAsDataURL(fl[0]);
         console.log(fr);
     }
 
     render() {
     
          return (
               <div className={`Gallery-Uploader`}>
                <input type={'file'} multiple={true} onChange={this.handleOnChange}/>
               </div>
          );
      
     }
 
}

export default GalleryUploader;