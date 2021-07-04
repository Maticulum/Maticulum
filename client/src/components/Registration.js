import React, { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

class Registration extends Component {
	
  constructor(props) {
        super(props);

        this.contract = props.contract;
        this.account = props.account;
  }
	
  RegisterUser = async() => {	  
	  const user = await this.contract.methods.GetUser().call({from: this.account});
	  alert(user[0]);
	  alert(user[1]);
  }	  
	
  render() {
    return (
        <div className="App">
            <h1>Register you</h1>  
			<Form.Control type="text" id="nameUser"
				 ref={(input) => { this.nameUser = input }}
				 />	
			 <Form.Control type="text" id="firstnameUser"
			 ref={(input) => { this.firstnameUser = input }}
			 />	
			<Card style={{ width: '50rem' }}>				
				<Button onClick={this.RegisterUser}>Register</Button>
			</Card>	
        </div>
    );
  }
}

export default Registration;
