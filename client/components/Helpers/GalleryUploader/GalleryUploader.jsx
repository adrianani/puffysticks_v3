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

             this.props.socket.on(`image uploaded`, ({newImage}) => {
                 this.props.onImageAdded(newImage);
             })
     }

    handleOnChange = e => {
         console.log(e.target.files);
         this.setState({images : e.target.files});
     }

     upload = e => {
         e.preventDefault();
         this.uploader.upload(this.state.images, { data : this.props.moreOptions || {}});
         this.inputRef.value = null;
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
                    multiple={this.props.multiple || false}
                    onChange={this.handleOnChange}
                    ref = {r => this.inputRef = r}
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
        socket : state.socket,
        Lang : state.lang
    }
}

export default connect(mapStateToProps)(GalleryUploader);