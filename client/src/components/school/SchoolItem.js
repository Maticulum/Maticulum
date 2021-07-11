import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Col, Container, Form, ListGroup, Row } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import Web3Context from '../../Web3Context';


class SchoolItem extends Component {
  
   static contextType = Web3Context;

   state = { id: null, name: '', town: '', country: '', administrators: ['', ''], validators: [], trainings: [] };
   

   async componentDidMount() {
      const id = this.props.match.params.schoolId;
      this.create = id === 'new';
      if (!this.create) {
         const school = await this.context.contract.methods.getSchool(id).call();
         console.log(school);
         this.setState({ id, ...school, trainings: [] });
         this.loadTrainings(school.trainings);
      }
      else {
         this.setState({ school: { name: ''}, administrators: [ this.context.account, '']});
      }
   }


   async loadTrainings(trainings) {
      if (trainings) {
         for (let i = 0; i < trainings.length; i++) {
            const id = trainings[i];
            const training = await this.context.contract.methods.getTraining(id).call();
            const list = [...this.state.trainings];
            list.push({ id: id, name: training.name });
            this.setState({ trainings: list });
         }
      }
   }


   onAddTraining = async () => {
      this.props.history.push(`/schools/${this.state.id}/trainings/new`);
   }


   onSave = async () => {
      if (this.create) {
         await this.context.contract.methods.addSchool(this.state.name, this.state.town, this.state.country, 
            this.state.administrators[0], this.state.administrators[1])
            .send({ from: this.context.account });
         this.props.history.push(`/schools`);
      }
      else {
         await this.context.contract.methods.updateSchool(this.state.id, this.state.name, this.state.town, this.state.country)
            .send({ from: this.context.account });
         this.props.history.push(`/schools`);
      }
   }


   render() {
      if (this.state.id === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;

      return (
         <Container fluid>
            <Row>
               <Col>
                  <Form>
                     <h3>Details</h3>
                     <Form.Group as={Row} >
                        <Form.Label column sm="2">{t('school.name')}</Form.Label>
                        <Col sm="10">
                           <Form.Control type="text" value={this.state.name} onChange={(e) => this.setState({name: e.target.value})} />
                        </Col>
                     </Form.Group>
                     <Form.Group as={Row} >
                        <Form.Label column sm="2">{t('school.town')}</Form.Label>
                        <Col sm="10">
                           <Form.Control type="text" value={this.state.town} onChange={(e) => this.setState({town: e.target.value})} />
                        </Col>
                     </Form.Group>
                     <Form.Group as={Row} >
                        <Form.Label column sm="2">{t('school.country')}</Form.Label>
                        <Col sm="10">
                           <Form.Control type="text" value={this.state.country} onChange={(e) => this.setState({country: e.target.value})} />
                        </Col>
                     </Form.Group>
                     <Form.Group>
                        <Form.Label>{t('school.administrators')}</Form.Label>
                     </Form.Group>
                     { this.state.administrators.map((administrator, index) => (
                        <Form.Group as={Row} key={index}>
                           <Form.Label column sm="2">{t('school.administrator')} {index + 1}</Form.Label>
                           <Col sm="10">
                              <Form.Control type="text" value={this.state.administrators[index]} onChange={(e) => {
                                    const admins = [...this.state.administrators];
                                    admins[index] = e.target.value;
                                    this.setState({ administrators: admins });
                                 }} />
                           </Col>
                        </Form.Group>
                     ))}
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
                     <Button onClick={ this.onSave }>{t('button.save')}</Button>
                  </Form>
               </Col>

               <Col>
                  <Row>
                     <Col>
                        <h3>Trainings</h3>
                     </Col>
                     <Col style={{ textAlign: 'right' }}>
                        <Button onClick={ this.onAddTraining } >Add training</Button>
                     </Col>
                  </Row>
                  <Row>
                  { this.state.trainings &&
                     <ul>
                        { this.state.trainings.map((training, index) => (
                           <li key={index}><a href={ `/schools/${this.state.id}/trainings/${training.id}` }>{training.name}</a></li>
                        ))}
                     </ul>
                  }
                  </Row>
               </Col>
            </Row>
               
         </Container>
      );
   }
}

export default withTranslation()(withRouter(SchoolItem));
