import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';


class Whitelisted extends Component {	
    
   constructor(props) {
        super(props);

        this.web3 = props.web3;
        this.account = props.account;
    }

  render() {
    return (
	  <Form>
        <h1>Whitelist user</h1> 
	  </Form>
    );
  }
}

export default Whitelisted;