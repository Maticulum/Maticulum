import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Container, Form } from 'react-bootstrap';

import Web3Context from '../../Web3Context';


class SchoolItem extends Component {
  
    static contextType = Web3Context;

    state = { school: null };
    

    async componentDidMount() {
        const id = this.props.match.params.schoolId;
        this.create = id === 'new';
        if (this.create) {
            this.setState({ school: { id: id, name: '', validators: [] }});
        }
        else {
            const school = await this.getSchool(id);
            console.log('School=', school);
            this.setState({ school: {
                id: id,
                name: school.name,
                validators: school.validators
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
            const tx = await this.context.contract.methods.addSchool(this.state.school.name).send({ from: this.context.account });
            const id = tx.events.SchoolAdded.returnValues.id;
            this.props.history.push(`/schools/${id}`);
        }
        else {
            await this.context.contract.methods.updateSchool(this.state.school.id, this.state.school.name).send({ from: this.context.account });
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
                        <Form.Control type="text" value={this.state.school.name} onChange={(e) => this.setState({name: e.target.value})} />
                    </Form.Group>
                    <Button onClick={ this.onSave }>Enregistrer</Button>
                </Form>
            </Container>
        );
    }
}

export default withRouter(SchoolItem);
