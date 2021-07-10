import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Col,Container, Form, ListGroup, Row } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import Web3Context from '../../Web3Context';


class SchoolItem extends Component {
  
   static contextType = Web3Context;

   state = { school: null, editedName: '', editedTown: '', editedCountry: '' };
   

   async componentDidMount() {
      const id = this.props.match.params.schoolId;
      this.create = id === 'new';
      if (this.create) {
         this.setState({ school: { id: id, name: '', administrators: ['', ''], validators: [] }});
      }
      else {
         const school = await this.context.contract.methods.schools(id).call();
         this.setState({ editedName: school.name, editedTown: school.town, editedCountry: school.country,
            school: {
               id: id,
               ...school
         } });
      }
   }


   onSave = async () => {
      // TODO check at least 2 admins
      if (this.create) {
         await this.context.contract.methods.addSchool(this.state.editedName, this.state.editedTown, this.state.editedCountry)
            .send({ from: this.context.account });
         this.props.history.push(`/schools`);
      }
      else {
         await this.context.contract.methods.updateSchool(this.state.school.id, this.state.editedName, this.state.editedTown, this.state.editedCountry)
            .send({ from: this.context.account });
         this.props.history.push(`/schools`);
      }
   }


   render() {
      if (this.state.school === null) {
         return <div>Loading...</div>;
      }

      const { t } = this.props;

      return (
         <Container>
               <Form>
                  <Form.Group as={Row} >
                     <Form.Label column sm="2">{t('school.name')}</Form.Label>
                     <Col sm="10">
                        <Form.Control type="text" value={this.state.editedName} onChange={(e) => this.setState({editedName: e.target.value})} />
                     </Col>
                  </Form.Group>
                  <Form.Group as={Row} >
                     <Form.Label column sm="2">{t('school.town')}</Form.Label>
                     <Col sm="10">
                        <Form.Control type="text" value={this.state.editedTown} onChange={(e) => this.setState({editedTown: e.target.value})} />
                     </Col>
                  </Form.Group>
                  <Form.Group as={Row} >
                     <Form.Label column sm="2">{t('school.country')}</Form.Label>
                     <Col sm="10">
                        <Form.Control type="text" value={this.state.editedCountry} onChange={(e) => this.setState({editedCountry: e.target.value})} />
                     </Col>
                  </Form.Group>
                  <Form.Group>
                     <Form.Label>{t('school.administrators')}</Form.Label>
                     <ListGroup>
                        { this.state.school.administrators.map((administrator, index) => (
                           <ListGroup.Item key={index}>{administrator}</ListGroup.Item>
                        ))}
                     </ListGroup>
                  </Form.Group>
                  <Form.Group>
                     <Form.Label>{t('school.validators')}</Form.Label>
                     { this.state.school.validators &&
                        <ListGroup>
                              { this.state.school.validators.map((validator, index) => (
                                 <ListGroup.Item key={index}>{validator}</ListGroup.Item>
                              ))}
                        </ListGroup>
                     }
                  </Form.Group>
                  <Button onClick={ this.onSave }>{t('school.save')}</Button>
               </Form>
         </Container>
      );
   }
}

export default withTranslation()(withRouter(SchoolItem));
