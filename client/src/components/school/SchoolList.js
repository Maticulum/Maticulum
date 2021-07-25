import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
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
         
         const validators = [];
         const validatorCount = await cm.getSchoolValidatorsCount(i).call();
         for (let j = 0; j < validatorCount; j++) {
            validators.push(await cm.getSchoolValidator(i, j).call());
         }

         schools.push({ id: i, ...school, validators });
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
                     <th>{t('table.validated')}</th>
                     <th></th>
                  </tr>
                  </thead>
                  <tbody>
                  { this.state.schools.map(school => (
                     <tr key={school.id}>
                        <td><a href={`/schools/${school.id}`}>{ school.name }</a></td>
                        <td>
                           { (school.validators ? school.validators.length : 0) + ' / ' + this.state.validationThreshold }
                        </td>
                        <td>
                           { this.context.isSuperAdmin && !school.validated && !school.validators.includes(this.context.account) &&
                              (<a href="" onClick={() => this.onValidate(school.id)} className="next"><i className="bi bi-check-square"></i>{t('button.validate')}</a>)
                           }
                        </td>
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
