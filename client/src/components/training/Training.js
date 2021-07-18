import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Col,Container, Form, InputGroup, Row } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import Web3Context from '../../Web3Context';


class Training extends Component {
  
   static contextType = Web3Context;

   state = { create: null, isAdmin: false, id: null, schoolId: null, schoolName: null, name: '', level: '', duration: 0, validationThreshold: 0, 
      juries: [], previousJuries: [] };
   

   async componentDidMount() {
      const schoolId = this.props.match.params.schoolId;
      const trainingId = this.props.match.params.trainingId;
      const cmSchool = this.context.contractSchool.methods;
      const cmTraining = this.context.contractTraining.methods;

      const isAdmin = await cmSchool.isSchoolAdmin(schoolId, this.context.account).call;
      this.setState({ isAdmin });

      const school = await cmSchool.schools(schoolId).call();
      this.setState({ schoolId, schoolName: school.name });

      const create = trainingId === 'new';
      if (create) {
         this.setState({ create: true });
      }
      else {
         const training = await cmTraining.trainings(trainingId).call();
         this.setState({ create: false, id: trainingId, ...training });
         
         const nbJuries = await cmTraining.getTrainingJuriesCount(trainingId).call();
         const juries = [];
         for (let i = 0; i < nbJuries; i++) {
            const jury = await cmTraining.getTrainingJury(trainingId, i).call();
            juries.push(jury);
         }
         this.setState({ juries, previousJuries: juries });
      }
   }


   onAddJury = () => {
      const list = this.state.juries;
      list.push('');
      this.setState({ juries: list });
   }


   onRemoveJury = (jury) => {
      const list = this.state.juries.filter(value => value !== jury);
      this.setState({ juries: list });
   }


   onJuryChange = (value, index) => {
      const juries = [...this.state.juries];
      juries[index] = value;
      this.setState({ juries });
   }


   onSave = async () => {
      if (this.state.create) {
         await this.context.contractTraining.methods.addTraining(this.state.schoolId, this.state.name, this.state.level, this.state.duration, this.state.validationThreshold,
            this.state.juries)
            .send({ from: this.context.account });
      }
      else {
         const addJuries = this.state.juries.filter(value => value !== '' && !this.state.previousJuries.includes(value));
         const removeJuries = this.state.previousJuries.filter(value => value !== '' && !this.state.juries.includes(value));
         await this.context.contractTraining.methods.updateTraining(this.state.id, this.state.name, this.state.level, this.state.duration, this.state.validationThreshold, 
            addJuries, removeJuries)
            .send({ from: this.context.account });
      }

      this.redirectToSchool();
   }


   redirectToSchool = () => {
      this.props.history.push(`/schools/${this.state.schoolId}`);
   }


   render() {
      if (this.state.create === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;

      return (
         <Container>
            <h3>{this.state.schoolName} - {t('training.training')}</h3>
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
               
               <hr />
               <Row>
                  <h3>{t('training.jury')}</h3>&nbsp;
                  { this.state.isAdmin && <Button variant="outline-success" onClick={ this.onAddJury }>{t('button.add')}</Button> }
               </Row>
               { this.state.juries.map((jury, index) => (
                  <Form.Group as={Row} key={index}>
                     <Form.Label column sm="2">{t('training.jury')} {index + 1}</Form.Label>
                     <Col sm="10">
                        <InputGroup>
                           <Form.Control type="text" value={this.state.juries[index]} onChange={(e) => this.onJuryChange(e.target.value, index)} />
                           <InputGroup.Append>
                              <Button variant="outline-danger" onClick={ () => this.onRemoveJury(jury) } >{t('button.delete')}</Button>
                           </InputGroup.Append>
                        </InputGroup>
                     </Col>
                  </Form.Group>
               ))}

               <hr />
               { this.state.isAdmin && <Button onClick={ this.onSave }>{t('button.save')}</Button> }
               &nbsp;
               <Button variant="outline-danger" onClick={ () => this.redirectToSchool() }>{t('button.cancel')}</Button>
            </Form>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(Training));
