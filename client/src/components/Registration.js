import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';


class Registration extends Component {
  state = { registeredButtonDisabled:''};	
 
  constructor(props) {
        super(props);

        this.contract = props.contract;
        this.account = props.account;	
		this.isRegistered = props.isRegistered;	

		this.onChange = this.onChange.bind(this);		
  }	
  
  componentDidMount = async () => {
	if(this.isRegistered){
	  this.GetThisUser();
	  this.setState({registeredButtonDisabled : 'true'});
	  alert(this.state.registeredButtonDisabled);
	}
  }

  GetThisUser = async() => {	  
	const user = await this.contract.methods.getUser().call({from: this.account});
	this.nameUser.value = user[0];
	this.firstnameUser.value = user[1];
  }	
  
  RegisterThisUser = async() => {	
    await this.contract.methods.Register(this.nameUser.value,this.firstnameUser.value).send({from: this.account}); 	  
  }	

  modifyUser = async() => {	  
	await this.contract.methods.UpdateUser(this.nameUser.value,this.firstnameUser.value).send({from: this.account});	  
  }	
  
  onChange(e) {
	if(!this.isRegistered){
		this.setState({ registeredButtonDisabled: e.target.value });	
	}
  }

  TestRegistration = async() => {	  
	alert(this.account);
  }		
	
  render() {	  
    return (
      <Form>
        <h1>Register you</h1>  
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" id="nameUser"
            ref={(input) => { this.nameUser = input }} 
			onChange={this.onChange}
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
          <Form.Control type="text" id="firstnameUser" 
		  
            ref={(input) => { this.firstnameUser = input }}
          />	
        </Form.Group>
        
        <Button disabled={!this.state.registeredButtonDisabled} className="next" onClick={this.RegisterThisUser}>Register</Button>
        <Button className="next" onClick={this.GetThisUser}>Get recorded User datas</Button>
        <Button className="next" onClick={this.modifyUser}>Update User</Button>
		
		<Button className="next" onClick={this.TestRegistration}>Is Registered ?</Button>
      </Form>
    );
  }
}

export default Registration;