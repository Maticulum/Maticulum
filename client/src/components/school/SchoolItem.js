import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Container, Form, ListGroup } from 'react-bootstrap';

import Web3Context from '../../Web3Context';


class SchoolItem extends Component {
  
    static contextType = Web3Context;

    state = { school: null, editedName: '' };
    

    async componentDidMount() {
        const id = this.props.match.params.schoolId;
        this.create = id === 'new';
        if (this.create) {
            this.setState({ school: { id: id, name: '', validators: [] }});
        }
        else {
            const school = await this.getSchool(id);
            console.log('School=', school);
            this.setState({ editedName: school.name, school: {
                id: id,
                ...school
            } });
            console.log(this.state.school);
        }
    }


    getSchool = async (id) => {
        return await this.context.contract.methods.getSchool(id).call();
    }


    onSave = async () => {
        console.log("create", this.create);
        if (this.create) {
            const tx = await this.context.contract.methods.addSchool(this.state.editedName).send({ from: this.context.account });
            const id = tx.events.SchoolAdded.returnValues.id;
            this.props.history.push(`/schools/${id}`);
        }
        else {
            await this.context.contract.methods.updateSchool(this.state.school.id, this.state.editedName).send({ from: this.context.account });
            this.props.history.push('/temp');
            this.props.history.replace(`/schools/${this.state.school.id}`);
        }
    }


    render() {
        if (this.state.school === null) {
            return <div>Loading...</div>;
        }

        return (
            <Container>
                <Form>
                    <Form.Group >
                        <Form.Label>Nom</Form.Label>
                        <Form.Control type="text" value={this.state.editedName} onChange={(e) => this.setState({editedName: e.target.value})} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Validateurs</Form.Label>
                        <ListGroup>
                            { this.state.school.validators.map((validator, index) => (
                                <ListGroup.Item key={index}>{validator}</ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Form.Group>
                    <Button onClick={ this.onSave }>Enregistrer</Button>
                </Form>
            </Container>
        );
    }
}

export default withRouter(SchoolItem);
