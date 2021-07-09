import { createTextNode } from 'min-document';
import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

import background from './assets/background.jpg';


class ImgTest extends Component {

  state = { showDownload: false, firstname: '', lastname: '', title: '' };


  onCreatePdf = () => {
    this.setState({ showDownload: true });    
    
    const canvas = document.createElement('canvas');
    console.log(canvas.toDataURL('image/png'));
    const context = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      context.drawImage(img, 0, 0);
      context.font = '20pt Verdana';

      context.fillText(this.state.title, 350, 120);
      context.fillText(this.state.firstname, 125, 175);
      context.fillText(this.state.lastname, 125, 215);

      console.log(canvas.toDataURL('image/png'));
    };

    img.src = document.getElementById('bg').src;
  }


  render() {
    return (
      <Container>
        <Form>
        <Form.Group as={Row} >
            <Form.Label column sm="2">Prénom</Form.Label>
            <Col sm="10">
              <Form.Control type="text" value={this.state.lastname} onChange={(e) => this.setState({lastname: e.target.value})} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} >
            <Form.Label column sm="2">Nom</Form.Label>
            <Col sm="10">
              <Form.Control type="text" value={this.state.firstname} onChange={(e) => this.setState({firstname: e.target.value})} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} >
            <Form.Label column sm="2">Diplome</Form.Label>
            <Col sm="10">
              <Form.Control type="text" value={this.state.title} onChange={(e) => this.setState({title: e.target.value})} />
              </Col>
          </Form.Group>
          { !this.state.showDownload && <Button onClick={ this.onCreatePdf }>Générer PDF</Button> }
          <img hidden id="bg" src={background} alt="" />
        </Form>
      </Container>
    );
  }
}

export default ImgTest;
