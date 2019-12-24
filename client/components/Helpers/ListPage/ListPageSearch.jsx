import React, { Component } from 'react';
import './ListPageSearch.scss';

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
                        placeholder={searchPlaceholder || ''}
                        onChange={e => this.props.updateSearch(e.target.value)}
                    />
                </div>
            </form>
        );

    }

}

export default ListPageSearch;