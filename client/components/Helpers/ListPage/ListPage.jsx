import PropTypes from 'prop-types'
import React, { Component } from 'react';
import './ListPage.scss';
import ListPageSearch from "./ListPageSearch";
import ListPagePagination from "./ListPagePagination";

class ListPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            items : [],
            search : ``,
            currentPage : 1,
            pagesCount : 0,
            loading : true
        };

        this.searchPlaceholder = `default_search_placeholder`;
        this.noItemsMessage = `default_no_items_message`;

        this.itemsPerPage = 10;

        this.socketMessages = {
            refreshItems : ``,
            listenForRefresh : ``
        };

        this.searchCriteria = `_id`;

        this.containerExtraClasses = ``;

        this._searchOnInputChange = true;
        this._minimumInputLength = 3;
        this._includeSearchbar = true;
    }

    prepareSearch = search => search;

    updateSearch = search => {
        this.setState({search}, () => {
            if (this._searchOnInputChange && (search.length >= this._minimumInputLength || !search.length)) {
                this.refreshItems();
            }
        });
    }

    updateItems = ({success, res, errors}) => {
        console.log(`[${this.constructor.name}] update list page`, {success, res, errors});
        if (success) {
            if (!res) return;
            this.setState({
                loading : false,
                items: res.items,
                pagesCount: res.count === undefined ? this.state.pagesCount : Math.ceil(res.count/this.itemsPerPage)
            });
        } else {
            this.props.addError(errors);
        }
    }

    refreshItems = () => {
        let {socket} = this.props;
        let {currentPage, search} = this.state;

        let data = {
            search,
            searchCriteria : this.searchCriteria,
            itemsPerPage : this.itemsPerPage,
            currentPage : currentPage - 1,
            ...this.props.moreOptions
        };

        socket.emit(this.socketMessages.refreshItems, data, this.updateItems);
    }

    submitSearch = search => {
        this.setState({search}, this.refreshItems);
    }

    componentDidMount() {
        this.refreshItems();
        let {socket} = this.props;

        socket.on(this.socketMessages.listenForRefresh, this.refreshItems);
    }

    componentWillUnmount() {
        let {socket} = this.props;
        socket.off(this.socketMessages.listenForRefresh);
    }

    getListContent = () => null;

    getList = () => {
        if (this.state.loading) return null;
        let {items} = this.state;

        if (!items.length) {
            return (
                <h2 className={`no-items`}>
                    {this.props.Lang.getWord(this.noItemsMessage)}
                </h2>
            );
        }

        return this.getListContent();
    }

    updateCurrentPage = currentPage => {
        let {pagesCount} = this.state;
        if (currentPage < 1 || currentPage > pagesCount) return;
        this.setState({currentPage}, this.refreshItems);
    }

    get searchbar () {
        if (!this._includeSearchbar) {
            return null;
        }

        return (
            <ListPageSearch
                search = {this.state.search}
                searchPlaceholder = {this.searchPlaceholder}
                updateSearch = {this.updateSearch}
                onSubmit = {this.refreshItems}
            />
        );
    }

    render() {
        return (
            <div className={`List-page${this.containerExtraClasses?" " + this.containerExtraClasses:``}`}>
                {this.searchbar}
                <ul className={`list-container`}>
                    {this.getList()}
                </ul>
                <ListPagePagination
                    pagesCount = {this.state.pagesCount}
                    currentPage = {this.state.currentPage}
                    updatePage = {this.updateCurrentPage}
                />
            </div>
        );

    }

}

export default ListPage;

ListPage.propTypes = {
  addError: PropTypes.any,
  moreOptions: PropTypes.any,
  socket: PropTypes.any
}

ListPage.defaultProps = {
  moreOptions: {}
}