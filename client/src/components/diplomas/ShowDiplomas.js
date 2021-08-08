import React, { Component } from "react";
import { Button, Card, Form, Container, Row, Col } from 'react-bootstrap';
import Web3Context from '../../Web3Context';
import { withTranslation } from "react-i18next";
import axios from "axios";

class ShowDiplomas extends Component {
	static contextType = Web3Context;
	
	state = {imageUrl:null };
	// to get the hash of the user stored in the blockchain 	
	getDiplomas = async() => {
		document.getElementById('diplomasImage').innerHTML = "";
		let address = this.searchDiploma.value;
		if(address != ""){
			let hashDiplomas = await this.context.contractNFT.methods.getUrisByAddress(address).call();
			
			if(hashDiplomas.length == 0){
				alert("No diplomas found")
				return;
			}
			
			for(let i =0;i<hashDiplomas.length;i++){				
				let urlImage = await this.context.contractNFT.methods.getURI(hashDiplomas[i]).call();
				await this.getImage(urlImage);
			}
		}
		else{
			alert("empty address field");
		}			
	}
	
	// get the json file and the image property with the link to show the image
	// the image of the diploma in the web page
	getImage = async(uri) => {
		const response = await axios ({
			url: uri,
			method: "GET"
		})	
		
		const { t } = this.props;
		const img = new Image();
		img.src = response.data.image;
		document.getElementById('diplomasImage').appendChild(img);
		
		var description = document.createElement('p'); // is a node
		description.innerHTML = "<b>" +t('diplome.description2') + "</b> : " + response.data.name;
		
		var name = document.createElement('p'); // is a node
		name.innerHTML = "<b>" +t('diplome.name') + "</b> : " + response.data.description;
		
		document.getElementById('diplomasImage').appendChild(description);
		document.getElementById('diplomasImage').appendChild(name);
	}
	
	label(){
		return(
			<label>Test</label>
		);
	}
				
   	render() {
		const { t } = this.props;
		return (
		<div>	
			<Container>
				<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
					</Form.Group>
				<Form>
					<Form.Group as={Row} >	
						<Form.Label column sm="3">{t('diplome.userAdress')}</Form.Label>						
						<Col sm="2">
						  <Form.Control type="text" id="searchDiploma" 
					      ref={(input) => { this.searchDiploma = input }}
						  />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >	
						<Form.Label column sm="3"></Form.Label>						
						<Col sm="2">
						  <Button onClick={ this.getDiplomas }>{t('diplome.searchDiplomas')}</Button> 
						</Col>
					</Form.Group>
					<Form.Group as={Row} >	
						<img src={this.state.imageUrl}/>
						<div id="diplomasImage"></div>
					</Form.Group>
				</Form>
			</Container>
		</div>
		
			
		);
	}
}
export default withTranslation()(ShowDiplomas);

