import React, { Component } from "react";
import { Button, Card, Form, Container, Row, Col } from 'react-bootstrap';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";
import background from './pdf/assets/background.jpg';
import axios from "axios";

class DiplomeMulti extends Component {
	static contextType = Web3Context;
	
	state = { linkDiplome : 'Diplome', linkVisible:false,
	hashImage:null,hashJson:null,fileToUpload:null, isButtonMetamaskVisible : false,
	showDownload: false, firstname: '', lastname: '', title: '',formData:null,
	files:null, hashes:[], pinataApiKey: 'aa60ffe97b2e16419dba',
	pinataSecretApiKey:'a4be1a2a85d05d6e350a13b82049e49c1afe9bb317531963e231f0a03d2a7158'  };
	
	handleFile = async(e) => {
		const { files, pinataSecretApiKey, pinataApiKey, file} = this.state; 	
		let filesImages = e.target.files;
		this.setState({ files : filesImages, linkVisible:true });
	}
	
	getJsonData = async (urlImage) => {
		const { hashes, pinataSecretApiKey, pinataApiKey, file} = this.state; 				
		const data ={ 
			"name": "DiplomeMaticulum",
			"image": urlImage,
			"description": "Diplome NFT hébergé par le smart contract MaticulumNFT"
		};
						
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
			hashes.push(ipfsHash);
			//
			this.setState({ hashJson : ipfsHash, isButtonMetamaskVisible:true});
        })
        .catch(function (error) {
            //handle error here
        }); 
	 
	};
	
	
	
	// gestion si annulation envoi diplôme
	onSendOneImage = async(formData, recipeUrl, postHeader) =>{	
		axios({
		  url: recipeUrl,
		  method: "POST",
		  headers: postHeader,
		  data: formData,
		})
		  .then(async (res) => { 
			let ipfsHash = res.data.IpfsHash;
			let urlMetadata = "https://gateway.pinata.cloud/ipfs/" + ipfsHash;	
			alert(urlMetadata);			
			this.setState({ linkDiplome : urlMetadata, linkVisible:true,
			hashImage:ipfsHash});
			await this.getJsonData(urlMetadata);
		  }) 
		  .catch((err) => { alert(err); });
	}
	
	createImagePinataAxios = async(e) => {		
		const { pinataSecretApiKey, pinataApiKey, files} = this.state; 		 
		alert(files[1]); 
		const recipeUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS/';
	    const postHeader = {
			pinata_api_key: pinataApiKey,
			pinata_secret_api_key: pinataSecretApiKey
		};

		for(let i =0;i<files.length;i++){
			let formData = new FormData();
			formData.append("file", files[i]);
			await this.onSendOneImage(formData, recipeUrl, postHeader);
		}
		
	}
	
	SendNFT = async() => { 
		const { hashes} = this.state;
		alert(hashes[0]);
		alert(hashes[1]);
		await this.context.contract.methods.createDiplomeNFTs(this.context.account,hashes).send({from:this.context.account});			
	}
		
	
		
	render() {
		const { t } = this.props; 
		
		return(
		<div style={{display: 'flex', justifyContent: 'center'}}>
		  <Card style={{ width: '50rem' }}>
            <Card.Header><strong>{t('diplome.sendNFT')}</strong></Card.Header>
            <Card.Body>			  
				<input type="file" id="avatar" accept="image/png, image/jpeg" 
				 multiple="multiple"	onChange={this.handleFile} />
			</Card.Body>
			{ 
				this.state.linkVisible ? 
				<Card.Body>
					<Button onClick={this.createImagePinataAxios}>{t('diplome.createNFT')}</Button>
				</Card.Body>
				: null
			}
			 
			<Card.Body>
					<Button onClick={this.SendNFT}>Envoi NFT</Button>
				</Card.Body>
          </Card>
        </div>	

		
		);
	}
}

export default withTranslation()(DiplomeMulti);