import React, { Component } from "react";
import { Button, Card, Form, Container, Row, Col } from 'react-bootstrap';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";
import axios from "axios";

class AdminSetPinataData extends Component {
	static contextType = Web3Context;	
		
	onCreateCryptedKey = async() => {
	    let cryptedAPI = btoa(this.cryptedAPIKey.value + this.pass.value);
		let cryptedSecretAPI = btoa(this.cryptedSecretAPIKey.value + this.pass.value);

		console.log(cryptedAPI); 
		console.log(cryptedSecretAPI); 
		
		await this.context.contractNFT.methods.changeHashToAPIKey(cryptedAPI).send({from:this.context.account});
		await this.context.contractNFT.methods.changeHashToSecretAPIKey(cryptedSecretAPI).send({from:this.context.account});
		
	}
	
	
	
	render() {
		const { t } = this.props; 
		
		return(
		<div style={{display: 'flex', justifyContent: 'center'}}>
			<Container>
				<Form>
					<Form.Group as={Row} >
					  <Form.Label column sm="3"></Form.Label>
						  <Col sm="2">
							<Button onClick={ this.onCreateCryptedKey }>Crypt keys</Button> 							
						  </Col>
					</Form.Group>				
					<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
						<Col sm="9">
							<Form.Control type="text" 
							id="tbxSchool" 
							ref={(input) => { this.cryptedAPIKey = input }}
							/>
						</Col>
					</Form.Group>	
					<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
						<Col sm="9">
							<Form.Control type="text" 
							id="tbxSchool" 
							ref={(input) => { this.cryptedSecretAPIKey = input }}
							/>
						</Col>
					</Form.Group>	
					<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
						<Col sm="9">
							<Form.Control type="password" 
							id="tbxSchool" 
							ref={(input) => { this.pass = input }}
							/>
						</Col>
					</Form.Group>					
				</Form>
			</Container>
        </div>	
		
		
		);
	}

}

export default withTranslation()(AdminSetPinataData);