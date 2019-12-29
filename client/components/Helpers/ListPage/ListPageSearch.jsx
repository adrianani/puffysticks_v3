import React, { Component } from 'react';
import './ListPageSearch.scss';
import {connect} from 'react-redux';

class ListPageSearch extends Component {

    constructor(props) {
        super(props);
    }

    submit = e => {
        e.preventDefault();
        this.props.onSubmit();
    }

    render() {
        let {
            search,
            searchPlaceholder
        } = this.props;

        return (
            <form className={`List-page-search-container`} onSubmit={this.submit}>
                <div className={`input-group`}>
                    <i className={`pufficon-search`} />
                    <input
                        type={`search`}
                        value={(search !== undefined) ? search : ``}
                        placeholder={this.props.Lang.getWord(searchPlaceholder) || ''}
                        onChange={e => this.props.updateSearch(e.target.value)}
                    />
                </div>
            </form>
        );

    }

}

const mapStateToProps = state => {
    return {
        Lang : state.lang
    }
}

export default connect(mapStateToProps)(ListPageSearch);