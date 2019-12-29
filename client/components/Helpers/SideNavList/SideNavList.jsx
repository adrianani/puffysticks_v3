import React, { Component } from 'react';
import './SideNavList.scss';
import {Link} from "react-router-dom";
import {connect} from 'react-redux';

class SideNavList extends Component {

     constructor(props) {
            super(props);

            this.state = {
            };
     }

     get title () {
         let {title} = this.props;

         if (title === undefined) return null;

         return (<h4>{title}</h4>);
     }

    get navItems () {
         let {navItems, selectedNavItem} = this.props;

         return navItems.map(item => {
             let selected = ``;
             if (item.key === selectedNavItem) {
                 selected = `selected`;
             }
            return (
                <li key={item.key}>
                    <Link to={item.url} className={selected}>
                        {this.props.Lang.getWord(item.title)}
                    </Link>
                </li>
            );
         });
     }

    render() {

          return (
              <div className={`side-container`}>
                  {this.title}
                  <ul className={`Side-Nav-List`} ref={r => this.listRef = r}>
                      {this.navItems}
                  </ul>
              </div>
          );

     }

}

const mapStateToProps = state => {
    return {
        Lang : state.lang
    }
}

export default connect(mapStateToProps)(SideNavList);