import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import Web3Context from '../../Web3Context';


class SchoolItem extends Component {
  
    static contextType = Web3Context;

    render() {
        console.log(this.context);
        const id = this.props.match.params.schoolId;

        return (
            <div>
            SchoolItem { id }
            </div>
        );
    }
}

export default withRouter(SchoolItem);
