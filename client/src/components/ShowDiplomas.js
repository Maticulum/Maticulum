import React, { Component } from "react";
import { Button, Card, Form, Container, Row, Col } from 'react-bootstrap';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";
import diplomaFrench from './pdf/assets/DiplomaFrench.jpg';
import diplomaEnglish from './pdf/assets/DiplomaEnglish.jpg';
import exempleJsonFrench from './pdf/assets/exempleJsonFrench.json'
import axios from "axios";

class ShowDiplomas extends Component {
	static contextType = Web3Context;
	
	state = {imageUrl:null };
	
	componentDidMount = async () => {
		await this.getDiplomas();
	}
	
	getDiplomas = async() => {
		let nbDiploma = await this.context.contractNFT.methods.getlastUriId().call();

		for(let i =0;i<nbDiploma;i++){
			let uri = await this.context.contractNFT.methods.getURI(i+1).call();
			this.getImage(uri);
		}
	}
	
	getImage = async(uri) => {
		const response = await axios ({
			url: uri,
			method: "GET"
		})			
		
		const img = new Image();
		img.src = response.data.image;
		document.getElementById('diplomasImage').appendChild(img);
	}
		
		
   	render() {
		return (
			<Card>
				<Card.Body>
					<img src={this.state.imageUrl}/>
				</Card.Body>	
				<div id="diplomasImage"></div>
			</Card>
		);
	}
}
export default withTranslation()(ShowDiplomas);

