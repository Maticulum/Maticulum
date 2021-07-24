import React, { Component } from 'react';
import { Badge, Button, Container, Table } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import Web3Context from '../../Web3Context';


class SuperAdminHome extends Component {

   static contextType = Web3Context;

   state = { init: false }

   async componentDidMount() {
      
   }


   render() {
      if (this.state.init === false) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;  

      return (
         <Container>
            SuperAdmin
         </Container>
      );
   }
}

export default withTranslation()(withRouter(SuperAdminHome));
