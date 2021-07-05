import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Button, Container, Row, Table } from 'react-bootstrap';

import Web3Context from '../../Web3Context';


class SchoolList extends Component {

  static contextType = Web3Context;

  state = { schools: null };

  async componentDidMount() {
    const schools = await this.getSchools();

    this.setState({ schools: schools });
  }

  getSchools = async () => {
    const size = await this.context.contract.methods.getNbSchools().call();

    let schools = [];
    for (let i = 0; i < size; i++) {
      const school = await this.context.contract.methods.getSchool(i).call();
      console.log('school=', school);
      schools.push({
        id: i,
        name: school.name,
        validators: school.validators
      });
    }

    return schools;
  }


  onNewSchool = () => {
    this.props.history.push('/schools/new')
  }


  getValidationStatus = (validators) => {
    if (validators.length >= 3) {
      return 'Oui';
    }
    
    return `Non (${validators.length} / 3)`;
  }


  render() {
    if (this.state.schools === null) {
      return <div>Loading...</div>;
    }    

    return (
      <Container>
        <Row className="main">
          <Button onClick={ this.onNewSchool } >Ajouter</Button>
        </Row>

        <Row>
          <Table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nom</th>
                <th>Validée</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              { this.state.schools.map(school => (
                <tr key={school.id}>
                  <td>{ school.id }</td>
                  <td>{ school.name }</td>
                  <td>{this.getValidationStatus(school.validators)}</td>
                  <td valign="top">
                    <Link to={`/schools/${school.id}`}><i className="bi bi-pencil-square"></i>Editer</Link>
                    <Link to={'#'} className="next"><i className="bi bi-check-square"></i>Valider</Link>
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

export default withRouter(SchoolList);
