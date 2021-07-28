import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Container, Row, Table } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import Web3Context from '../../Web3Context';


class SchoolList extends Component {

   static contextType = Web3Context;

   state = { schools: null, validationThreshold: 0 };

   async componentDidMount() {
      const schools = await this.getSchools();
      const validationThreshold = await this.context.contractSchool.methods.schoolValidationThreshold().call();

      this.setState({ schools: schools, validationThreshold });
   }

   getSchools = async () => {
      const cm = this.context.contractSchool.methods;
      const size = await cm.getSchoolsCount().call();

      let schools = [];
      for (let i = 0; i < size; i++) {
         const school = await cm.schools(i).call();

         schools.push({ id: i, ...school });
      }

      return schools;
   }


   onNewSchool = () => {
      this.props.history.push('/schools/new')
   }


   onValidate = async (id) => {
      await this.context.contract.methods.validateSchool(id).send({from: this.context.account});
      this.props.history.push('/temp');
      this.props.history.replace('/schools');
   }


   render() {
      if (this.state.schools === null) {
         return <div>Loading...</div>;
      }    

      const { t } = this.props;

      return (
         <Container>
            <Row className="main">
               <Button variant="outline-success" onClick={ this.onNewSchool }>{t('button.add')}</Button>
            </Row>

            <Row>
               <Table>
                  <thead>
                  <tr>
                     <th>{t('table.name')}</th>
                  </tr>
                  </thead>
                  <tbody>
                  { this.state.schools.map(school => (
                     <tr key={school.id}>
                        <td><a href={`/schools/${school.id}`}>{ school.name }</a></td>
                     </tr>
                  ))}
                  </tbody>
               </Table>
            </Row>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(SchoolList));
