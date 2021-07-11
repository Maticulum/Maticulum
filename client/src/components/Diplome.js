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
	grade:'',diplomaName:'',files:[], sendNFT:false, hashes:[] };
		
	getPinataApiKey(){
		let paramPinataApiKey = 'YWE2MGZmZTk3YjJlMTY0MTlkYmFhbnQ=';
		return atob(paramPinataApiKey).split(this.mdp.value)[0];
	}
	
	getPinataSecretApiKey(){
		let paramPinataSecretApiKey = 'YTRiZTFhMmE4NWQwNWQ2ZTM1MGExM2I4MjA0OWU0OWMxYWZlOWJiMzE3NTMxOTYzZTIzMWYwYTAzZDJhNzE1OGFudA==';
		return atob(paramPinataSecretApiKey).split(this.mdp.value)[0];		
	}
	
	getJsonData = async () => {
		const { linkDiplome, hashJson, hashes} = this.state; 				
		const data ={ 
			"name": "DiplomeMaticulum",
			"image": this.state.linkDiplome,
			"description": "Diplome NFT hébergé par le smart contract MaticulumNFT"
		};
		
	  	let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();
						
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
			
			this.setState({ hashJson : ipfsHash});
        })
        .catch(function (error) {
            //handle error here
        }); 
	 
	};
	
	publiPostage = async() => {
		await this.createImageDiplome("Albert","Ména","Université de Tours","","Licence","Mathématiques");
		await this.createImageDiplome("Léa","François","Université d'Angers","","Master","Cybernétique");		
	}
	
	createImageDiplome = async(firstname, lastname,school,typeDiploma, grade, diplomaName) => {
		const { files } = this.state; 
		
		let userDatas = firstname + lastname + school;
		const canvas = document.createElement('canvas');		
		console.log(canvas.toDataURL('image/png'));
		const context = canvas.getContext('2d');
		const data = new TextEncoder().encode(userDatas);
		const buffer = await window.crypto.subtle.digest('SHA-256', data);
		
		const img = new Image();
		img.onload = () => {
		  canvas.width = img.width;
		  canvas.height = img.height;
		  
		  context.drawImage(img, 0, 0);
		  context.font = '20pt Verdana';

		  //context.fillText(this.state.title, 350, 120);
		  context.fillText(firstname, 125, 175);
		  context.fillText(lastname, 125, 215);	
		  context.fillText(school, 10, 35);	
		  context.fillText(typeDiploma, 400, 215);	
		  context.fillText(grade + " " + diplomaName, 175, 120);
		  context.fillText("attribué à partir du 12/08/2021" , 200, 300);
		  
		  const hashString = Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');	
							
		  canvas.toBlob((blob) => {
			const file=  new File([blob], hashString + '.png');
			files.push(file);
		  });
		  this.setState({ linkVisible:true});	  		  
		};
		
		img.src = document.getElementById('bg').src;
		
		document.body.appendChild(canvas); 
		document.getElementById('diplomaImage').appendChild(canvas);
	}
		
	onCreateDiplome = async() => {
		const { files } = this.state; 	
		this.setState({ showDownload: true });  		
		//document.getElementById('diplomaImage').innerHTML = "";
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
							
		  canvas.toBlob((blob) => {
			const file=  new File([blob], hashString + '.png');
			files.push(file);
		  });
		  this.setState({ linkVisible:true});	  		  
		};
		
		img.src = document.getElementById('bg').src;
		
		document.body.appendChild(canvas); 
		document.getElementById('diplomaImage').appendChild(canvas);
	}
	
	onSendOneImage = async(formData, recipeUrl, postHeader) => {	
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
			await this.getJsonData(urlMetadata);
		  }) 
		  .catch((err) => { alert(err); });
	}
	
	createImagePinataAxios = async(e) => {		
		const { formData, linkDiplome, files} = this.state; 
		
		let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();
		
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
		
		this.setState({ sendNFTVisibility : true});
	}
	
	SendNFTToSmartContract = async() => {
		const { hashes } = this.state; 
		await this.context.contract.methods.createDiplomeNFTs(this.context.account,hashes).send({from:this.context.account});
		this.setState({ isButtonMetamaskVisible:true});
	}
	
	AddInMetamask = async() => {
		const { accounts, contractStaking, web3 } = this.state; 
		const tokenAddress = await this.context.contract.methods.nft().call();
		const tokenSymbol = 'MTCF';
		const tokenDecimals = 0;
		const tokenImage = 'https://gateway.pinata.cloud/ipfs/QmYFRV2wZtPjGgKXQkHKEcw8ayuYDcNyUcuYFy726h5DuC'; // get from IPFS

		try {
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
		
	showFile = async (e) => {
		e.preventDefault()
		const reader = new FileReader();
		reader.onload = async (e) => { 
		  const text = (e.target.result);
		  const lines = text.split(/\r\n|\n/);
		  
		  for(let i =0;i<lines.length;i++){
			alert(lines[i]);
			const line = lines[i].split(',');
			await this.createImageDiplome(line[0],line[1],line[2],"",line[3],line[4]);	
		  }
		};
		
		reader.onerror = (e) => alert(e.target.error.name);
		reader.readAsText(e.target.files[0])		
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
					  <Col sm="1">
						<Button onClick={ this.onCreateDiplome }>{t('diplome.generateImage')}</Button> 
						<img hidden id="bg" src={background} alt="" />
					  </Col>					  
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Clé IPFS</Form.Label>
						<Col sm="9">
							<Form.Control type="password" id="mdp" ref={(input) => { this.mdp = input }} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
					  <Form.Label column sm="2"></Form.Label>
					  <Col sm="1">
					  </Col>
					  { 
						this.state.linkVisible ? 
						<Col sm="1">
							<Button onClick={this.createImagePinataAxios}>{t('diplome.createNFT')}</Button>
						  </Col>
						: null
					  }
					  { 
						this.state.sendNFTVisibility ? 
						<Card.Body>
							<Button onClick={this.SendNFTToSmartContract}>Envoi NFT</Button>
						</Card.Body>
						: null
					  }				  
					  { 
						this.state.isButtonMetamaskVisible ? 
						<Col sm="3">
							<Button onClick={this.AddInMetamask}>{t('diplome.addMetamask')}</Button>
						</Col>
						: null
					  }
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Création en masse</Form.Label>
						<Col sm="9">
							<Button onClick={this.publiPostage}>Créer diplômes</Button>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Vue</Form.Label>
						<Col sm="9">
							<div>
							  <input type="file" onChange={(e) => this.showFile(e)} />
							</div>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">Vue</Form.Label>
						<Col sm="9">
							<div id="diplomaImage"></div>
						</Col>
					</Form.Group>
				</Form>
			</Container>
		  
        </div>	
		
		
		);
	}
}

export default withTranslation()(Diplome);