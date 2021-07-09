import React, { Component } from "react";
import { Button, Nav, Navbar, NavDropdown, Card, Form } from 'react-bootstrap';
import { Link  } from 'react-router-dom';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";

import axios from "axios";

class Diplome extends Component {
	static contextType = Web3Context;
	
	state = { linkDiplome : 'Diplome', linkVisible:false,
	hashImage:null,hashJson:null};
	handleFile(e) {
		// Getting the files from the input
		let files = e.target.files[0];
		this.setState({ fileToUpload : files });
	}
	
	getJsonData = async () => {
		const { linkDiplome, hashJson} = this.state; 				
		const data ={ 
			"name": "DiplomeMaticulum",
			"image": [this.state.linkDiplome],
			"description": "Diplome NFT hébergé par le smart contract MaticulumNFT"
		};
		
	  	let pinataApiKey = 'aa60ffe97b2e16419dba';
		let pinataSecretApiKey = 'a4be1a2a85d05d6e350a13b82049e49c1afe9bb317531963e231f0a03d2a7158';
						
		const JSONBody = JSON.parse(JSON.stringify(data));
			
		
		const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS/`;
		return axios.post(url, JSONBody, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(async (response) => {
            let ipfsHash = response.data.IpfsHash;	
			let urlMetadata = "https://gateway.pinata.cloud/ipfs/" + ipfsHash;
			await this.context.contract.methods.createDiplomeNFT(this.context.account,ipfsHash).send({from:this.context.account});
			
			this.setState({ hashJson : ipfsHash});
        })
        .catch(function (error) {
            //handle error here
        }); 
	 
	};
	
	createImagePinataAxios = async(e) => {		
		
		const { linkDiplome} = this.state;  
		let file = e.target.files[0];

		let pinata_api_key = 'aa60ffe97b2e16419dba';
		let pinata_secret_api_key = 'a4be1a2a85d05d6e350a13b82049e49c1afe9bb317531963e231f0a03d2a7158';
		  
		const recipeUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS/';
	    const postHeader = {
			pinata_api_key: pinata_api_key,
			pinata_secret_api_key: pinata_secret_api_key
		};

		let formData = new FormData();
		formData.append("file", file);

		axios({
		  url: recipeUrl,
		  method: "POST",
		  headers: postHeader,
		  data: formData,
		})
		  .then(async (res) => { 
			let ipfsHash = res.data.IpfsHash;
			let urlMetadata = "https://gateway.pinata.cloud/ipfs/" + ipfsHash;	 
			this.setState({ linkDiplome : urlMetadata, linkVisible:true,
			hashImage:ipfsHash});
			await this.getJsonData();
		  }) 
		  .catch((err) => { alert(err); }); 
	}
		
	render() {
		const { t } = this.props; 
		
		return(
		<div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>{t('diplome.sendNFT')}</strong></Card.Header>
            <Card.Body>			  
			  <input type="file" class="filename" id="avatar"  accept="image/png, image/jpeg" 
				onChange={this.createImagePinataAxios} />
			  
			  { 
				this.state.linkVisible ? 
				<Link visibility="hidden" to={this.state.linkDiplome}>{this.state.linkDiplome}</Link> 
				: null
			  }
			</Card.Body>
          </Card>
		  
		 
        </div>
		
		);
	}
}

export default withTranslation()(Diplome);