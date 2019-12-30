import React, { Component } from 'react';
import './GalleryUploader.scss';
import {connect} from 'react-redux';
import SocketIOFileCLient from 'socket.io-file-client';

class GalleryUploader extends Component {

     constructor(props) {
            super(props);
            
            this.state = {
                images : []
            };

            this.uploader = new SocketIOFileCLient(props.socket);

             this.uploader.on('start', function(fileInfo) {
                 console.log('Start uploading', fileInfo);
             });
             this.uploader.on('stream', function(fileInfo) {
                 console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
             });
             this.uploader.on('complete', function(fileInfo) {
                 console.log('Upload Complete', fileInfo);
             });
             this.uploader.on('error', function(err) {
                 console.log('Error!', err);
             });
             this.uploader.on('abort', function(fileInfo) {
                 console.log('Aborted: ', fileInfo);
             });
     }

    handleOnChange = e => {
         console.log(e.target.files);
         this.setState({images : e.target.files});
     }

     upload = () => {
         this.uploader.upload(this.state.images, {uploadTo : "temp", data : 'galleryUploader'});
     }

     getPreviews = () => {
         let {images} = this.state;
         if (!images.length) return null;

         return (
             <div className={`preview-container`}>
                 {Array.from(images).map((img, i) => (
                     <div
                         key={i}
                         className={`preview`}
                         style={{backgroundImage : `url(${URL.createObjectURL(img)})`}}
                     />
                 ))}
             </div>
         );
     }
 
     render() {
     
          return (
               <div className={`Gallery-Uploader`}>
                <input
                    type={'file'}
                    multiple={true}
                    onChange={this.handleOnChange}

                />
                   {this.getPreviews()}
                <button
                    className={`btn primary`}
                    onClick={this.upload}
                >
                    upload
                </button>
               </div>
          );
      
     }
 
}

const mapStateToProps = state => {
    return {
        socket : state.socket
    }
}

export default connect(mapStateToProps)(GalleryUploader);