import React, { Component } from 'react';
import './GalleryUploader.scss';
import {connect} from 'react-redux';
import SocketIOFileCLient from 'socket.io-file-client';

class GalleryUploader extends Component {

     constructor(props) {
            super(props);
            
            this.state = {
                totalFilesToUpload : 0,
                filesUploaded : 0,
                uploading : false
            };

            this.uploader = new SocketIOFileCLient(props.socket);

             this.uploader.on('start', function(fileInfo) {
                 console.log('Start uploading', fileInfo);
             });
             this.uploader.on('stream', function(fileInfo) {
                 console.log('Streaming... sent ' + fileInfo.sent + ' bytes.');
             });
             this.uploader.on('complete', function(fileInfo) {
                 // this.setState({uploading: false});
                 console.log('Upload Complete', fileInfo);
             });
             this.uploader.on('error', function(err) {
                 console.log('Error!', err);
                 this.setState({uploading : false});
             });
             this.uploader.on('abort', function(fileInfo) {
                 console.log('Aborted: ', fileInfo);
                 this.setState({uploading : false});
             });


     }

     componentDidMount() {
         this.props.socket.on(`image uploaded`, ({newImage}) => {
             this.props.onImageAdded(newImage);
             let {filesUploaded, totalFilesToUpload} = this.state;
             filesUploaded++;
             if (filesUploaded >= totalFilesToUpload) {
                 this.setState({filesUploaded}, () => {
                     setTimeout(() => {
                         this.setState({uploading : false});
                     }, 500);
                 });
             } else {
                 this.setState({filesUploaded});
             }
         });
         this.props.socket.on(`image error`, ({errors}) => {
             this.props.addError(errors);
             this.setState({uploading : false});
         });
     }

     componentWillUnmount() {
         this.props.socket.off(`image uploaded`);
         this.props.socket.off(`image error`);
     }

    handleOnChange = e => {
        e.preventDefault();
        if (!e.target.files.length) return;
        this.uploader.upload(e.target.files, { data : this.props.moreOptions || {}});

        this.setState({
            totalFilesToUpload : e.target.files.length,
            filesUploaded : 0,
            uploading : true
        });
        e.target.value = null;
     }

     getFakeUploader = () => {
         let {totalFilesToUpload, filesUploaded, uploading} = this.state;

         let inner = null;
         let uploadingString = ``;
         if (uploading) {
             uploadingString = ` uploading`;
             let height = totalFilesToUpload ? (filesUploaded / totalFilesToUpload) * 100 : 0;
             inner = (
                 <>
                     <span>
                         {this.props.Lang.getWord("gallery_uploading")}
                     </span>
                     <div className={`fake-uploader-progress`} style={{height : `${height}%`}}/>
                  </>
             );
         } else {
             inner = (
                 <div className={`btns-container`}>
                     <div className={`btn primary`}>
                         {this.props.Lang.getWord("select_image")}
                     </div>
                     <span className={`sep`}>{this.props.Lang.getWord("or")}</span>
                     <div className={`empty btn`}>
                         {this.props.Lang.getWord("drop_images")}
                     </div>
                 </div>
             );
         }

         return (
             <div className={`fake-uploader${uploadingString}`}>
                 {inner}
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
                   {this.getFakeUploader()}
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
        addError : error => dispatch({type : "ADD_ERROR", error})
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GalleryUploader);