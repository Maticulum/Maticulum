import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
import Web3Context from "../Web3Context";


class Registration extends Component {
  static contextType = Web3Context; 	
  
  componentDidMount = async () => {
	const isRegistered = await this.context.contract.methods.isRegistered().call({from: this.context.account});
	if(isRegistered){
	  this.GetThisUser();
	}
  }

  GetThisUser = async() => {	  
	const user = await this.context.contract.methods.getUser().call({from: this.context.account});
	this.nameUser.value = user[0];
	this.firstnameUser.value = user[1];
	const idRole = user[3];
	
	this.getRole(idRole);	
  }	
  
  getRole(idRole) {	
	 if(idRole == 0){
	  this.roleUser.value = "Administrator";
	}
	else if(idRole == 1){
	  this.roleUser.value = "Jury";
	}
	else if(idRole == 2){
	  this.roleUser.value = "Student";
	} 
  }  

  modifyUser = async() => {	  
	await this.context.contract.methods.userModifications(this.nameUser.value,this.firstnameUser.value).send({from: this.context.account});	  
  }	
  
  onChange(e) {
	if(!this.isRegistered){
		this.setState({ registeredButtonDisabled: e.target.value });	
	}
  }

  TestRegistration = async() => {
    const registered = await this.context.contract.methods.isRegistered().call(
	{from:this.context.account});	  
	alert(registered);
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
		
		<Form.Group>
          <Form.Label>Role</Form.Label>
          <Form.Control type="text" id="roleUser" 
		    disabled="true"
            ref={(input) => { this.roleUser = input }}
          />	
        </Form.Group>
                
        <Button className="next" onClick={this.GetThisUser}>Get recorded User datas</Button>
        <Button className="next" onClick={this.modifyUser}>Update User</Button>		
      </Form>
    );
  }
}

export default Registration;