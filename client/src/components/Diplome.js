import React, { Component } from "react";
import { Button, Nav, Navbar, NavDropdown, Card, Form } from 'react-bootstrap';
import { Link  } from 'react-router-dom';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";

import axios from "axios";

class Diplome extends Component {
	static contextType = Web3Context;
	
	state = { linkDiplome : 'Diplome', linkVisible:false,
	hashImage:null,hashJson:null,fileToUpload:null, isButtonMetamaskVisible : false};	
	
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
			
			this.setState({ hashJson : ipfsHash, isButtonMetamaskVisible:true});
        })
        .catch(function (error) {
            //handle error here
        }); 
	 
	};
	
	// TODO gestion si annulation envoi diplôme
	
	createImagePinataAxios = async(e) => {		
		const { fileToUpload, linkDiplome} = this.state; 
		
		let file = fileToUpload;

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
		
	AddInMetamask = async() => {
	const { accounts, contractStaking, web3 } = this.state; 
	const tokenAddress = await this.context.contract.methods.getNFTAddress().call({from: this.context.account});
	const tokenSymbol = 'MTCF';
	const tokenDecimals = 0;
	const tokenImage = 'https://ipfs.io/ipfs/QmeYp7Et2owcGBinFiSsU2Tdjvpeq2BzaW1bEpzVyhE8WV?filename=hermes.png'; // get from IPFS

	try {
	  // wasAdded is a boolean. Like any RPC method, an error may be thrown.
	  const wasAdded = await window.ethereum.request({
		method: 'wallet_watchAsset',
		params: {
		  type: 'ERC20', // Initially only supports ERC20, but eventually more!
		  options: {
			address: tokenAddress, // The address that the token is at.
			symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
			decimals: tokenDecimals, // The number of decimals in the token
			image: tokenImage, // A string url of the token logo
		  },
		},
	  });

	  if (wasAdded) {
		console.log('Thanks for your interest!');
	  } else {
		console.log('Your loss!');
	  }
	} catch (error) {
	  console.log(error);
	}
  }	
		
	render() {
		const { t } = this.props; 
		
		return(
		<div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>{t('diplome.sendNFT')}</strong></Card.Header>
            <Card.Body>			  
				<input type="file" id="avatar" accept="image/png, image/jpeg" 
					onChange={this.handleFile} />
				</Card.Body>
			{ 
				this.state.linkVisible ? 
				<Card.Body>
					<Button onClick={this.createImagePinataAxios}>{t('diplome.createNFT')}</Button>
				</Card.Body>
				: null
			}
			 
			{ 
				this.state.isButtonMetamaskVisible ? 
				<Card.Body>
					<Button onClick={this.AddInMetamask}>{t('diplome.addMetamask')}</Button>
				</Card.Body>
				: null
			}
          </Card>
        </div>		
		);
	}
}

export default withTranslation()(Diplome);