import React, { Component } from 'react';
import {connect} from 'react-redux';
import './Debug.scss';

/* Lang.create({shortcut: 'en', name: 'english', default: true}, (err, lang) => {
    console.log(lang.id, err);
    db.LangWord.create(
        {key: 'work_with_us_question', string: 'Interested in working with us?', langid: lang._id}, 
        {key: 'contact_us', string: 'get in touch', langid: lang._id}, 
        {key: 'categories', string: 'categories', langid: lang._id},
        {key: 'all', string: 'all', langid: lang._id},
        {key: 'logos', string: 'logos', langid: lang._id},
        {key: 'web_design', string: 'web design', langid: lang._id},
        {key: 'ipb_themes', string: 'ipb design', langid: lang._id},
        {key: 'illustrations_and_drawings', string: 'illustration & drawings', langid: lang._id},
    );
}); */

class Debug extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pre: [],
        }
    }

    componentDidMount() {
        let {socket} = this.props,
            lang = { _id: '5e04c8eb2dcb7d51688a5fb4' };
        socket.emit('put words', {
            words: [
                {_id: '5e05f9cfe570931e40e0d991', key: 'work_with_us_question', string: 'Interesat sa lucrezi cu noi?'}, 
            ]
        }, (response) => {
            this.setState(state => {
                return {pre: [...state.pre, response]};
            });
        });
    }

    render() {
        let {client} = this.props;
        return (
            <pre>
                {JSON.stringify(this.state.pre, null, 4)}
            </pre>
        );
    }
}

const mapStateToProps = state => {
    return {
        socket : state.socket,
        client : state.client
    }
};

export default connect(mapStateToProps)(Debug);