import React, { Component } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { PDFDownloadLink } from '@react-pdf/renderer';

import PDFDocument from './PdfDocument';


class PdfTest extends Component {

  state = { showDownload: false, firstname: '', lastname: '', title: '', data: null };


  onCreatePdf = () => {
    const data = {
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      title: this.state.title
    };
    this.setState({ showDownload: true, data});
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
          { this.state.showDownload && <PDFDownloadLink className="btn btn-primary" document={<PDFDocument data={this.state.data} />} fileName="diplome.pdf">
              {({ blob, url, loading, error}) => loading ? 'Préparation du document...' : 'Télécharger' }
            </PDFDownloadLink>
          }
        </Form>
      </Container>
    );
  }
}

export default PdfTest;
