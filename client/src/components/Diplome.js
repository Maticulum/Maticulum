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
	showDownload: false, firstname: '', lastname: '', school : '', formData:null,
	grade:'',diplomaName:'',files:[], sendNFT:false, hashes:[], sizeFile:0,
	loading:false, gateway:null, jsonUrlApi:null, imageUrlAPi:null,
	paramPinataApiKey:null, paramPinataSecretApiKey:null, hashesImage:[],
	urlPinAPI:null};
		
	componentDidMount = async () => {
		const { gateway, jsonUrlApi, imageUrlAPi,paramPinataApiKey,paramPinataSecretApiKey
		,urlPinAPI} = this.state; 
		
		let gatewaysData = await this.context.contractNFT.methods.getGatewaysData().call();
		
		let gatewayURL = gatewaysData[0];
		let jsonAPI = gatewaysData[1];
		let imageAPI = gatewaysData[2];
		let pinAPI = gatewaysData[3];
		let paramPinataApi = gatewaysData[4];
		let paramPinataSecretApi = gatewaysData[5];
		let hashToken = gatewaysData[5];
		
		this.setState({ gateway : gatewayURL, 
		jsonUrlApi: jsonAPI, imageUrlAPi: imageAPI,urlPinAPI:pinAPI,
		paramPinataApiKey:paramPinataApi, paramPinataSecretApiKey:paramPinataSecretApi
		});
	}		
		
	getPinataApiKey(){ 
		const { paramPinataApiKey} = this.state;
		return atob(paramPinataApiKey).split(this.mdp.value)[0];
	}
	
	getPinataSecretApiKey(){
		const { paramPinataSecretApiKey} = this.state;
		return atob(paramPinataSecretApiKey).split(this.mdp.value)[0];		
	}
	
	getJsonData = async (linkDiplome) => {
		const { hashJson, hashes, sendNFTVisibility, sizeFile, 
				loading, gateway, jsonUrlApi, revert} = this.state; 				
		const { t } = this.props;  
		
		const data ={ 
			"name": t('diplome.jsonName'),
			"image": linkDiplome,
			"description": t('diplome.description')
		};
		
	  	let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();
		
		const JSONBody = JSON.parse(JSON.stringify(data));			
		
		const url = jsonUrlApi;
		return axios.post(url, JSONBody, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
            }
        })
        .then(async (response) => {
            let ipfsHash = response.data.IpfsHash;	
			let urlMetadata = gateway + ipfsHash; 
			hashes.push(ipfsHash);	
			let finished = hashes.length == sizeFile;	
			if(finished){
				this.setState({ loading:false});
				await this.SendNFTToSmartContract();
			}
			else{
				this.setState({ hashJson : ipfsHash});
			}
        })
        .catch(function (error) {
            alert("error in sendind NFT contact our developpement team");
        }); 
	 
	};
	
	createImageDiplome = async(firstname, lastname,school, grade, diplomaName) => {
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
          const { t } = this.props; 
		  context.fillText(firstname, 125, 175);
		  context.fillText(lastname, 125, 215);	
		  context.fillText(school, 10, 35);		
		  context.fillText(grade + " " + diplomaName, 175, 120);
		  
		  const timeElapsed = Date.now();
		  const today = new Date(timeElapsed);
		  
		  context.fillText(t('diplome.attribution') + today.toLocaleDateString(), 200, 300);
		  
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
		await this.createImageDiplome(this.state.firstname, this.state.lastname,this.state.school,
		"", this.state.grade, this.state.diplomaName);
	}
	
	clearDiplomas = async() =>  {
		document.getElementById('diplomaImage').innerHTML = "";	
		this.tbxDiplomaName.value = "";
		this.tbxGrade.value = "";
		this.tbxSchool.value = "";
		this.tbxFirstname.value = "";
		this.tbxLastname.value = "";
		this.setState({ linkVisible:false,isButtonMetamaskVisible:false, 
		hashes : [],hashesImage : []});
	}
	
	onSendOneImage = async(formData, recipeUrl, postHeader) => {	
	    const { gateway, hashesImage } = this.state; 
		let cancelTransaction = false;
		
		axios({
		  url: recipeUrl,
		  method: "POST",
		  headers: postHeader,
		  data: formData,
		})
	    .then(async (res) => { 
			let ipfsHash = res.data.IpfsHash;
		    let urlMetadata = gateway + ipfsHash;	
		    hashesImage.push(ipfsHash);			
		    this.setState({ linkDiplome : urlMetadata, linkVisible:true,hashImage:ipfsHash});
		    await this.getJsonData(urlMetadata);			
	    }) 
	    .catch((err) => { 
		   alert("error in sendind NFT contact our developpement team :" + err); 
	    });
	}
	
	createImagePinataAxios = async(e) => {		
		const { formData, linkDiplome, files, imageUrlAPi} = this.state; 
		
		let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();
		
		const recipeUrl = imageUrlAPi;
	    const postHeader = {
			pinata_api_key: pinataApiKey,
			pinata_secret_api_key: pinataSecretApiKey  
		};
		
		const { sizeFile} = this.state;
		this.setState({ sizeFile : files.length})
		for(let i = 0;i<files.length;i++){
			let formData = new FormData();
			formData.append("file", files[i]);			
			await this.onSendOneImage(formData, recipeUrl, postHeader);
		}
		
		this.setState({ loading:true});
	}
	
	SendNFTToSmartContract = async() => {
		const { hashes, hashesImage, urlPinAPI } = this.state; 
		const { t } = this.props;
		
		let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();
		
		let annulationNotYetShown = true;
		
		this.context.contractNFT.methods.AddNFTsToAdress(this.context.account,hashes)
		.send({from:this.context.account}) 
		.then(async (response) => {
			
		})
		.catch(function (error, receipt) {
			for(let i = 0;i<hashes.length;i++){	
				const axios = require('axios');
				let url = urlPinAPI + hashes[i];
				axios
					.delete(url, {
						headers: {
							pinata_api_key: pinataApiKey,
							pinata_secret_api_key: pinataSecretApiKey
						}
					})
					.then(function (response) {
						if(annulationNotYetShown){
						   annulationNotYetShown = false;
						   alert(t('diplome.cancelTransaction'));
						}
					})
					.catch(function (error) {
						
					});
				url = urlPinAPI + hashesImage[i];
				axios
					.delete(url, {
						headers: {
							pinata_api_key: pinataApiKey,
							pinata_secret_api_key: pinataSecretApiKey
						}
					})
					.then(function (response) {
						if(annulationNotYetShown){
						   annulationNotYetShown = false;
						   alert(t('diplome.cancelTransaction'));
						}
					})
					.catch(function (error) {
						
					});
			}
		});
		/*.on("error",function(error,receipt){
			hasError = true;
			alert("onError");
		});	*/
		this.setState({ isButtonMetamaskVisible:true});
	}
	
	AddInMetamask = async() => {
		const { hashTokenNFT, gateway}= this.state; 
		const tokenAddress = await this.context.contract.methods.nft().call();
		
		let nftDatas = await this.context.contractNFT.methods.getNFTDatas().call();
		
		const tokenSymbol = nftDatas[1];		
		const tokenImage = gateway + nftDatas[2];
		
		const tokenDecimals = 0;

		try {
		  const wasAdded = await window.ethereum.request({
			method: 'wallet_watchAsset',
			params: {
			  type: 'ERC20', // works for ERC721 too
			  options: {
				address: tokenAddress, 
				symbol: tokenSymbol, 
				decimals: tokenDecimals, 
				image: tokenImage, 
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
						<Form.Label column sm="3">{t('formlabel.name')}</Form.Label>
						<Col sm="9">
						  <Form.Control type="text" 
						  onChange={(e) => this.setState({firstname: e.target.value})} 
						  id="tbxLastname" ref={(input) => { this.tbxLastname = input }}
						  />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('formlabel.firstname')}</Form.Label>
						<Col sm="9">
						  <Form.Control type="text"  
						  onChange={(e) => this.setState({lastname: e.target.value})}
						  id="tbxFirstname " ref={(input) => { this.tbxFirstname = input }}
						  />
						</Col>						
					 </Form.Group>					
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('diplome.school')}</Form.Label>
						<Col sm="9">
							<Form.Control type="text" 
							onChange={(e) => this.setState({school: e.target.value})} 
							id="tbxSchool" ref={(input) => { this.tbxSchool = input }}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('diplome.grade')}</Form.Label>
						<Col sm="9">
							<Form.Control type="text"  
							onChange={(e) => this.setState({grade: e.target.value})} 
							id="tbxGrade" ref={(input) => { this.tbxGrade = input }}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('diplome.diplomaName')}</Form.Label>
						<Col sm="9">
							<Form.Control type="text" 
							onChange={(e) => this.setState({diplomaName: e.target.value})} 
							id="tbxDiplomaName" ref={(input) => { this.tbxDiplomaName = input }}
							/>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
					  <Form.Label column sm="3"></Form.Label>
						  <Col sm="2">
							<Button onClick={ this.onCreateDiplome }>{t('diplome.generateImage')}</Button> 
							<img hidden id="bg" src={background} alt="" />
						  </Col>	
						  <Col sm="2">
							<Button onClick={ this.clearDiplomas }>{t('diplome.clearDiplomas')}</Button> 
						  </Col>					  
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('diplome.IPFSkey')}</Form.Label>
						<Col sm="9">
							<Form.Control type="password" id="mdp" ref={(input) => { this.mdp = input }} />
						</Col>
					</Form.Group>					
					<Form.Group as={Row} >
					    <Form.Label column sm="3"></Form.Label>
						{ 
							this.state.linkVisible ? 
							<Col sm="2">
								<Button onClick={this.createImagePinataAxios}>{t('diplome.createNFT')}</Button>
							 </Col>
							: null
						}
						{ 
							this.state.loading ? 
							<Col sm="3">
								<label>{t('diplome.loading')}</label>
							</Col>	
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
						<Form.Label column sm="3">{t('diplome.publishFromFile')}</Form.Label>
						<Col sm="9">
							<input type="file" onChange={(e) => this.showFile(e)} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('diplome.awaitedFormat')}</Form.Label>
						<Col sm="9">
							<Form.Control disabled type="text" 
							value={t('formlabel.firstname') + "," + 
								  t('formlabel.name') + "," + 
								  t('diplome.school') + "," + 
								  t('diplome.grade') + "," + 
								  t('diplome.diplomaName')} />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
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