import React, { Component } from "react";
import { Button, Card, Form, Container, Row, Col } from 'react-bootstrap';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";
import background from './pdf/assets/background.jpg';
import axios from "axios";

class Diplome extends Component {
	static contextType = Web3Context;
	
	state = { linkDiplome : 'Diplome', linkVisible:false,
	hashImage:null,hashJson:null,fileToUpload:null, isButtonMetamaskVisible : false,
	showDownload: false, firstname: '', lastname: '', title: '',school : '', typeDiploma:'',formData:null,
	grade:'',diplomaName:'', };
	
	handleFile = async(e) => {
		let files = e.target.files[0];
		let formData = new FormData();
		formData.append("file", files);
		this.setState({ formData : formData, linkVisible:true });
	}
	
	getJsonData = async () => {
		const { linkDiplome, hashJson} = this.state; 				
		const data ={ 
			"name": "DiplomeMaticulum",
			"image": this.state.linkDiplome,
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
		
	onCreatePdf = async() => {
		this.setState({ showDownload: true });  		
		document.getElementById('diplomaImage').innerHTML = "";
		const canvas = document.createElement('canvas');		
		console.log(canvas.toDataURL('image/png'));
		const context = canvas.getContext('2d');
		
		let userDatas = this.state.firstname + this.state.lastname + this.state.school;
		
		const data = new TextEncoder().encode(userDatas);
		const buffer = await window.crypto.subtle.digest('SHA-256', data);

		const img = new Image();
		img.onload = () => {
		  canvas.width = img.width;
		  canvas.height = img.height;
		  
		  context.drawImage(img, 0, 0);
		  context.font = '20pt Verdana';

		  //context.fillText(this.state.title, 350, 120);
		  context.fillText(this.state.firstname, 125, 175);
		  context.fillText(this.state.lastname, 125, 215);	
		  context.fillText(this.state.school, 10, 35);	
		  context.fillText(this.state.typeDiploma, 400, 215);	
		  context.fillText(this.state.grade + " " + this.state.diplomaName, 175, 120);
		  context.fillText("attribué à partir du 30/06/2017" , 200, 300);
		  
		  const hashString = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');	
				
          let formData = new FormData();			
		  canvas.toBlob((blob) => {
			formData.append("file", new File([blob], hashString + '.png'));
		  });
		  this.setState({ linkVisible:true, formData:formData });	  		  
		};
		
		img.src = document.getElementById('bg').src;
		
		document.body.appendChild(canvas); 
		document.getElementById('diplomaImage').appendChild(canvas);
	}
	
	// gestion si annulation envoi diplôme
	
	createImagePinataAxios = async(e) => {		
		const { formData, linkDiplome} = this.state; 
		
		let pinata_api_key = 'aa60ffe97b2e16419dba';
		let pinata_secret_api_key = 'a4be1a2a85d05d6e350a13b82049e49c1afe9bb317531963e231f0a03d2a7158';
		  
		const recipeUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS/';
	    const postHeader = {
			pinata_api_key: pinata_api_key,
			pinata_secret_api_key: pinata_secret_api_key
		};

		axios({
		  url: recipeUrl,
		  method: "POST",
		  headers: postHeader,
		  data: formData,
		})
		  .then(async (res) => { 
			let ipfsHash = res.data.IpfsHash;
			alert(ipfsHash);
			let urlMetadata = "https://gateway.pinata.cloud/ipfs/" + ipfsHash;	 
			this.setState({ linkDiplome : urlMetadata, linkVisible:true,
			hashImage:ipfsHash});
			await this.getJsonData();
		  }) 
		  .catch((err) => { alert(err); }); 
	}
		
	AddInMetamask = async() => {
		const { accounts, contractStaking, web3 } = this.state; 
		const tokenAddress = await this.context.contract.methods.nft().call();
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
			<Container>
				<Form>
					<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
						<Form.Label column sm="9">{t('diplome.diplomaBuid')}</Form.Label>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('formlabel.firstname')}</Form.Label>
						<Col sm="9">
						  <Form.Control type="text" value={this.state.lastname} onChange={(e) => this.setState({lastname: e.target.value})} />
						</Col>
					 </Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('formlabel.name')}</Form.Label>
						<Col sm="9">
						  <Form.Control type="text" value={this.state.firstname} onChange={(e) => this.setState({firstname: e.target.value})} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('diplome.diploma')}</Form.Label>
						<Col sm="9">
							<Form.Control type="text" value={this.state.title} onChange={(e) => this.setState({title: e.target.value})} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Type</Form.Label>
						<Col sm="9">
							<label> 
								<select id="lang">
								  <option value="Certificate" onChange={(e) => this.setState({title: e.target.value})}>Certificat</option>
								  <option value="diploma" onChange={(e) => this.setState({title: e.target.value})}>Diplôme</option>
							   </select>
							</label>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Ecole</Form.Label>
						<Col sm="9">
							<Form.Control type="text" value={this.state.school} onChange={(e) => this.setState({school: e.target.value})} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Niveau</Form.Label>
						<Col sm="9">
							<Form.Control type="text" value={this.state.grade} onChange={(e) => this.setState({grade: e.target.value})} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Intitulé</Form.Label>
						<Col sm="9">
							<Form.Control type="text" value={this.state.diplomaName} onChange={(e) => this.setState({diplomaName: e.target.value})} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
					  <Form.Label column sm="3"></Form.Label>
					  <Col sm="9">
						<Button onClick={ this.onCreatePdf }>{t('diplome.generateImage')}</Button> 
						<img hidden id="bg" src={background} alt="" />
					  </Col>
					</Form.Group>
				</Form>
			</Container>
			
		  
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
		  
		    
		  
		  <div id="diplomaImage">
		
		  </div>
        </div>	
		
		
		);
	}
}

export default withTranslation()(Diplome);