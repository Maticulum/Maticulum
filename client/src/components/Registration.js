import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';


class Registration extends Component {
	
  constructor(props) {
        super(props);

        this.contract = props.contract;
        this.account = props.account;
  }
	
<<<<<<< Updated upstream
  getUser = async() => {	  
	  const user = await this.contract.methods.getUser().call({from: this.account});
	  alert(user[0]);
  }	

  registerUser = async() => {	  
	  await this.contract.methods.register(this.nameUser.value,this.firstnameUser.value).send({from: this.account});
	  
=======
  GetUser = async() => {	  
	  const user = await this.contract.methods.GetUser().call({from: this.account});
	  this.nameUser.value = user[0];
	  this.firstnameUser.value = user[1];
  }	

  RegisterUser = async() => {	  
	  await this.contract.methods.Register(this.nameUser.value,this.firstnameUser.value).send({from: this.account});	  
>>>>>>> Stashed changes
  }	

  modifyUser = async() => {	  
	  await this.contract.methods.updateUser(this.nameUser.value,this.firstnameUser.value).send({from: this.account});
	  
  }	  
	
  render() {
    return (
      <Form>
        <h1>Register you</h1>  
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" id="nameUser"
            ref={(input) => { this.nameUser = input }}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>First name</Form.Label>
          <Form.Control type="text" id="firstnameUser"
            ref={(input) => { this.firstnameUser = input }}
          />	
        </Form.Group>
        
        <Button onClick={this.registerUser}>Register</Button>
        <Button className="next" onClick={this.getUser}>Get User</Button>
        <Button className="next" onClick={this.modifyUser}>Update User</Button>
      </Form>
    );
  }
}

export default Registration;
