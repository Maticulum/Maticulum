import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Col,Container, Form, ListGroup, Row } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import Web3Context from '../Web3Context';


class Training extends Component {
  
   static contextType = Web3Context;

   state = { create: null, schoolId: null, schoolName: null, name: '', level: '', duration: 0, validationThreshold: 0, juries: [] };
   

   async componentDidMount() {
      const schoolId = this.props.match.params.schoolId;
      const trainingId = this.props.match.params.trainingId;

      const school = await this.context.contract.methods.getSchool(schoolId).call();
      this.setState({ schoolId, schoolName: school.name });

      const create = trainingId === 'new';
      if (create) {
         this.setState({ create: true });
      }
      else {
         const training = await this.context.contract.methods.getTraining(trainingId).call();
         this.setState({ create: false, ...training });
      }
   }


   onSave = async () => {
      if (this.state.create) {
         await this.context.contract.methods.addTraining(this.state.schoolId, this.state.name, this.state.level, this.state.duration, this.state.validationThreshold)
            .send({ from: this.context.account });
      }
      else {
         // TODO
         //await this.context.contract.methods.updateSchool(this.state.school.id, this.state.editedName, this.state.editedTown, this.state.editedCountry)
         //   .send({ from: this.context.account });
      }

      this.props.history.push(`/schools/${this.state.schoolId}`);
   }


   render() {
      if (this.state.create === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;

      return (
         <Container>
            <h3>{this.state.schoolName} - Training</h3>
            <Form>
               <Form.Group as={Row} >
                  <Form.Label column sm="2">{t('training.name')}</Form.Label>
                  <Col sm="10">
                     <Form.Control type="text" value={this.state.name} onChange={(e) => this.setState({name: e.target.value})} />
                  </Col>
               </Form.Group>
               <Form.Group as={Row} >
                  <Form.Label column sm="2">{t('training.level')}</Form.Label>
                  <Col sm="10">
                     <Form.Control type="text" value={this.state.level} onChange={(e) => this.setState({level: e.target.value})} />
                  </Col>
               </Form.Group>
               <Form.Group as={Row} >
                  <Form.Label column sm="2">{t('training.duration')} ({t('training.hours')})</Form.Label>
                  <Col sm="10">
                     <Form.Control type="text" value={this.state.duration} onChange={(e) => this.setState({duration: e.target.value})} />
                  </Col>
               </Form.Group>
               <Form.Group as={Row} >
                  <Form.Label column sm="2">{t('training.validationThreshold')}</Form.Label>
                  <Col sm="10">
                     <Form.Control type="text" value={this.state.validationThreshold} onChange={(e) => this.setState({validationThreshold: e.target.value})} />
                  </Col>
               </Form.Group>
               
               <Button onClick={ this.onSave }>{t('button.save')}</Button>
            </Form>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(Training));
