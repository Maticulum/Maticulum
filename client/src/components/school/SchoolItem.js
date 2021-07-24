import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import Web3Context from '../../Web3Context';


class SchoolItem extends Component {
  
   static contextType = Web3Context;

   state = { isSchoolAdmin: false, create: null, id: null, name: '', town: '', country: '', juryValidation: '1',
      administrators: ['', ''], validators: [], trainings: [] };
   

   async componentDidMount() {
      const id = this.props.match.params.schoolId;
      const cm = this.context.contractSchool.methods;

      const isSchoolAdmin = await cm.isSchoolAdmin(id, this.context.account).call;
      this.setState({ isSchoolAdmin });

      const create = id === 'new';
      if (create) {
         this.setState({ create: true, administrators: [ this.context.account, '']});
      }
      else {
         const school = await cm.schools(id).call();
         this.loadTrainings(id);

         const administrators = [];
         const administratorsCount = await cm.getSchoolAdministratorsCount(id).call();
         for (let i = 0; i < administratorsCount; i++) {
            administrators.push(await cm.getSchoolAdministrator(id, i).call());
         }

         const validators = [];
         const validatorsCount = await cm.getSchoolValidatorsCount(id).call();
         for (let i = 0; i < validatorsCount; i++) {
            validators.push(await cm.getSchoolValidator(id, i).call());
         }

         this.setState({ create: false, id, ...school, administrators, validators });
      }
   }


   async loadTrainings(schoolId) {
      const list = [];
      const cm = this.context.contractSchool.methods;

      const nbTrainings = await cm.getSchoolTrainingsCount(schoolId).call();
      for (let i = 0; i < nbTrainings; i++) {
         const id = await cm.getSchoolTraining(schoolId, i).call();
         const training = await this.context.contractTraining.methods.trainings(id).call();
         list.push({ id: id, name: training.name });
      }

      this.setState({ trainings: list });
   }


   onAddTraining = async () => {
      this.props.history.push(`/schools/${this.state.id}/trainings/new`);
   }


   onSave = async () => {
      const cm = this.context.contractSchool.methods;

      if (this.state.create) {
         await cm.addSchool(this.state.name, this.state.town, this.state.country, this.state.juryValidation,
            this.state.administrators[0], this.state.administrators[1])
            .send({ from: this.context.account });         
      }
      else {
         await cm.updateSchool(this.state.id, this.state.name, this.state.town, this.state.country, this.state.juryValidation,)
            .send({ from: this.context.account });
      }

      this.props.history.push(`/schools`);
   }


   onAdministratorUpdate = (value, index) => {
      const admins = [...this.state.administrators];
      admins[index] = value;
      this.setState({ administrators: admins });
   }


   render() {
      if (this.state.create === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;
      const readOnly = !this.context.isSuperAdmin;

      return (
         <Container fluid={!this.state.create} >
            <Row>
               <Col>
                  <Form>
                     <h3>{t('school.details')}</h3><hr />
                     <Form.Group as={Row} >
                        <Form.Label column sm="2">{t('school.name')}</Form.Label>
                        <Col>
                           <Form.Control type="text" readOnly={readOnly} plaintext={readOnly}
                              value={this.state.name} onChange={(e) => this.setState({name: e.target.value})} />
                        </Col>
                     </Form.Group>
                     <Form.Group as={Row} >
                        <Form.Label column sm="2">{t('school.town')}</Form.Label>
                        <Col>
                           <Form.Control type="text" readOnly={readOnly} plaintext={readOnly}
                              value={this.state.town} onChange={(e) => this.setState({town: e.target.value})} />
                        </Col>
                     </Form.Group>
                     <Form.Group as={Row} >
                        <Form.Label column sm="2">{t('school.country')}</Form.Label>
                        <Col>
                           <Form.Control type="text" readOnly={readOnly} plaintext={readOnly}
                              value={this.state.country} onChange={(e) => this.setState({country: e.target.value})} />
                        </Col>
                     </Form.Group>
                     <h4>{t('school.administrators')}</h4>
                     { this.state.administrators.map((administrator, index) => (
                        <Form.Group as={Row} key={index}>
                           <Form.Label column sm="2">{t('school.administrator')} {index + 1}</Form.Label>
                           <Col>
                              <Form.Control type="text" readOnly={readOnly} plaintext={readOnly}
                                 value={this.state.administrators[index]} onChange={(e) => this.onAdministratorUpdate(e.target.value, index) } />
                           </Col>
                        </Form.Group>
                     ))}
                     { !this.state.create && 
                        <Form.Group>
                           <Form.Label>{t('school.validators')}</Form.Label>
                           { this.state.validators &&
                              <ListGroup>
                                    { this.state.validators.map((validator, index) => (
                                       <ListGroup.Item key={index}>{validator}</ListGroup.Item>
                                    ))}
                              </ListGroup>
                           }
                        </Form.Group>
                     }
                     { !readOnly && 
                        <Button onClick={ this.onSave }>{t('button.save')}</Button>
                     }
                  </Form>
               </Col>

               { !this.state.create &&
               <Col>
                  <h3>{t('school.trainings')}</h3>
                  <hr />
                  { this.state.trainings &&
                     <ListGroup>
                        { this.state.trainings.map((training, index) => (
                           <ListGroup.Item key={index}><a href={ `/schools/${this.state.id}/trainings/${training.id}` }>{training.name}</a></ListGroup.Item>
                        ))}
                     </ListGroup>
                  }
                  <hr />
                  { this.state.isSchoolAdmin && <Button variant="outline-success" onClick={ this.onAddTraining } >{t('school.addTraining')}</Button> }
               </Col>
               }
            </Row>
               
         </Container>
      );
   }
}

export default withTranslation()(withRouter(SchoolItem));
