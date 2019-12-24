import React, { Component } from 'react';

class AdminPage extends Component {

     constructor(props) {
            super(props);

            this.pageKey = props.pageKey || ``;
     }

     componentDidMount() {
         this.props.setPageKey(this.pageKey);
     }

     render () {
         return null;
     }

}

export default AdminPage;