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
      const validationThreshold = await this.context.contract.methods.schoolValidationThreshold().call();

      this.setState({ schools: schools, validationThreshold });
   }

   getSchools = async () => {
      const size = await this.context.contract.methods.getNbSchools().call();

      let schools = [];
      for (let i = 0; i < size; i++) {
         const school = await this.context.contract.methods.getSchool(i).call();
         schools.push({
            id: i,
            ...school
         });
      }

      return schools;
   }


   onNewSchool = () => {
      this.props.history.push('/schools/new')
   }


   onValidate = async (id) => {
      const tx = await this.context.contract.methods.validateSchool(id).send({from: this.context.account});
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
                     <th>#</th>
                     <th>{t('table.name')}</th>
                     <th>{t('table.validated')}</th>
                     <th>{t('table.action')}</th>
                  </tr>
                  </thead>
                  <tbody>
                  { this.state.schools.map(school => (
                     <tr key={school.id}>
                        <td>{ school.id }</td>
                        <td>{ school.name }</td>
                        <td>
                        { school.validators && school.validators.length >= this.state.validationThreshold ?
                           (<i className="bi bi-check2-all" style={{color:'green'}}></i>) :
                           ((school.validators ? school.validators.length : 0) + ' / 3')
                        }
                        </td>
                        <td valign="top">
                        <Link to={`/schools/${school.id}`}><i className="bi bi-pencil-square"></i>{t('button.edit')}</Link>
                        { this.context.isSuperAdmin && (!school.validators || !school.validators.includes(this.context.account)) &&
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
