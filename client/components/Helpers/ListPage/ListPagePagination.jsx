import React, { Component } from 'react';
import './ListPagePagination.scss';

class ListPagePagination extends Component {

    constructor(props) {
        super(props);

        this.state = {};
    }

    getPrevBtn = () => {
        let {currentPage, updatePage} = this.props;

        let action = (currentPage === 1) ? () => {} : () => updatePage(currentPage - 1);
        let isDisabled = (currentPage === 1) ? ` is-disabled` : ``;

        return (
            <button
                className={`btn${isDisabled}`}
                onClick={action}
            >Prev</button>
        );
    }

    getNextBtn = () => {
        let {pagesCount, currentPage, updatePage} = this.props;

        let action = (currentPage === pagesCount) ? () => {} : () => updatePage(currentPage + 1);
        let isDisabled = (currentPage === pagesCount) ? ` is-disabled` : ``;

        return (
            <button
                className={`btn${isDisabled}`}
                onClick={action}
            >Next</button>
        );
    }

    getPageItem = pageNumber => {
        let {currentPage, updatePage} = this.props;

        let action = (currentPage !== pageNumber) ? () => updatePage(pageNumber) : () => {}
        let isCurrent = (currentPage !== pageNumber) ? `` : ` is-current`;

        return (
            <button
                key = {pageNumber}
                className={`empty btn page-list-item${isCurrent}`}
                onClick={action}
            >
                {pageNumber}
            </button>
        );
    }

    getPageList = () => {
        let {pagesCount, currentPage} = this.props;

        if (pagesCount < 7) {
            let arr = [];
            for (let i = 1; i <= pagesCount; ++i) {
                arr.push(this.getPageItem(i));
            }
            return arr;
        }

        let firstPart = null;
        let middlePart = null;
        let lastPart = null;

        if (currentPage < 4) {
            firstPart = [1,2,3,4].map(el => this.getPageItem(el));
        } else {
            firstPart =  this.getPageItem(1);
        }

        if (currentPage - 1 >= 3 && pagesCount - currentPage >= 3) {
            middlePart = [
                <i key="first-sep" className={`pufficon-more page-list-sep`} />,
                this.getPageItem(currentPage - 1),
                this.getPageItem(currentPage),
                this.getPageItem(currentPage + 1)
            ];
        }

        if (pagesCount - currentPage < 3) {
            lastPart = [<i key="last-sep" className={`pufficon-more page-list-sep`} />];
            for (let i = pagesCount - 3; i <= pagesCount; ++i) {
                lastPart.push(this.getPageItem(i));
            }
        } else {
            lastPart = [
                <i key="last-sep" className={`pufficon-more page-list-sep`} />,
                this.getPageItem(pagesCount)
            ];
        }

        return (
            <>
                {firstPart}
                {middlePart}
                {lastPart}
            </>
        );
    }

    render() {
        let {pagesCount} = this.props;

        if (pagesCount < 2) return (<></>);

        return (
            <div className={`List-page-pagination-container no-select`}>
                {this.getPrevBtn()}
                <div className={`page-list`}>
                    {this.getPageList()}
                </div>
                {this.getNextBtn()}
            </div>
        );

    }

}

export default ListPagePagination;