import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup';
import Web3Context from "../Web3Context";

class Whitelisted extends Component {	
   static contextType = Web3Context;
   state = { role: -1 }
   constructor(props) {
        super(props);

        this.web3 = props.web3;
        this.account = props.account;
    }
	
	Registration = async() => {
		if(this.state.role != -1){
			await this.context.contract.methods
			.whitelistByAdmin(this.addressUser.value,this.state.role).send({from: this.context.account});
		}
		else{
			alert("You have to choose a role");
		}
	}
	
	Role = async(e, idrole) => {
		this.state.role = idrole;
	}

  render() {
    return (
	  <Form>
        <h1>Recording user</h1>  
        <Form.Group>
          <Form.Label>Address</Form.Label>
          <Form.Control type="text" id="addressUser"
            ref={(input) => { this.addressUser = input }} 
			onChange={this.onChange} />
		      <ListGroup>
				<ListGroup.Item action href="#link1" onClick={(e) => {
					this.Role(e, 1);
				}}>
				  Jury
				</ListGroup.Item>
				<ListGroup.Item action href="#link2" onClick={(e) => {
					this.Role(e, 2);
				}}>
				  Student
				</ListGroup.Item>
			  </ListGroup>
		  
        </Form.Group>
		<Button className="next" onClick={this.Registration}>Register address</Button>
      </Form>
    );
  }
}

export default Whitelisted;