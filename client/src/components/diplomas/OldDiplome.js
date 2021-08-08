import React, { Component } from "react";
import { Button, Card, Form, Container, Row, Col } from 'react-bootstrap';
import Web3Context from '../../Web3Context';
import { withTranslation } from "react-i18next";
import background from '../pdf/assets/background.jpg';
import axios from "axios";

class OldDiplome extends Component {
	static contextType = Web3Context;
	
	state = { linkDiplome : 'Diplome', linkVisible:false,
	hashImage:null,hashJson:null,fileToUpload:null, isButtonMetamaskVisible : false,
	showDownload: false, firstname: '', lastname: '', title: '',formData:null,
	files:null, hashes:[], pinataApiKey: '',
	pinataSecretApiKey:'',sendNFTVisibility:false, sizeFile:0, 
	gateway:null, loading:false,	jsonUrlApi:null, imageUrlAPi:null,
	paramPinataApiKey:null, paramPinataSecretApiKey:null,hashesImage:[],
	urlPinAPI:null, cancelTransaction:false, trainings:[],
	schoolId:null,trainingId:null};
	
	// on the load of the page
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
		
		let trainingsCount = await this.context.contractTraining.methods.getTrainingsCount().call();	
		let trainingsAll = [];
		trainingsAll.push({name:"",id: -1});
		
		for(let i = 0;i<trainingsCount;i++){			
			let training = await this.context.contractTraining.methods.trainings(i).call();			
			trainingsAll.push({name:training[1],id: i});
		}
		
		this.setState({ gateway : gatewayURL, 
		jsonUrlApi: jsonAPI, imageUrlAPi: imageAPI,urlPinAPI:pinAPI,
		paramPinataApiKey:paramPinataApi, paramPinataSecretApiKey:paramPinataSecretApi,
		trainings:trainingsAll
		});			
	}	

	GetValuePair = async (event) => {	
		var index = event.nativeEvent.target.selectedIndex;
		let cbxTrainingId = event.nativeEvent.target[index].value;		
		let training = await this.context.contractTraining.methods.trainings(cbxTrainingId).call();		
		this.setState({ schoolId : training[0], trainingId:cbxTrainingId });
	}
	
	// on loading of file
	handleFile = async(e) => {
		const { files, pinataSecretApiKey, pinataApiKey, file} = this.state; 	
		let filesImages = e.target.files;
		this.setState({ files : filesImages, linkVisible:true });
	}
	
	// Send the JSON file hash to Pinata API with as image the link 
	// created with the pinate API image hash response 
	getJsonData = async (linkDiplome) => {
		const { hashes, file, sendNFTVisibility, sizeFile, loading, gateway, jsonUrlApi} = this.state; 	
		const { t } = this.props; 
		
		const data ={ 
			"name": t('diplome.jsonName'),
			"image": linkDiplome,
			"description": t('diplome.description')
		};
						
		const JSONBody = JSON.parse(JSON.stringify(data));
		
		const pinataApiKey = this.getPinataApiKey();
		const pinataSecretApiKey = this.getPinataSecretApiKey();		
		
		return axios.post(jsonUrlApi, JSONBody, {
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
				await this.SendNFT();
			}
			else{
				this.setState({ hashJson : ipfsHash});
			}
			
        })
        .catch(function (error) {
            alert(error);
        }); 
	 
	};
	
	// To add the symbolNFT in Metamask with one image
	AddInMetamask = async() => {
		const { hashTokenNFT, gateway}= this.state;		
		const tokenAddress = await this.context.contractNFT._address;
		
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
	
	// send one image to dedicated Pinata API 
	onSendOneImage = async(formData, postHeader, recipeUrl) =>{	
		const { hashesImage, gateway } = this.state; 
		const { t } = this.props; 
		
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
			this.setState({ linkDiplome : urlMetadata, linkVisible:true,
			hashImage:ipfsHash});
			await this.getJsonData(urlMetadata);
		  }) 
		  .catch((err) => { 
			alert(t('diplome.errorSendingNFT') + err); 
		  });
	}
	
	// Take the files created with images to send then to Pinata
	createImagePinataAxios = async(e) => { 		
		const { files, imageUrlAPi} = this.state; 		
		
		const pinataApiKey = this.getPinataApiKey();
		const pinataSecretApiKey = this.getPinataSecretApiKey();
			
        const recipeUrl = imageUrlAPi;			
	    const postHeader = {
			pinata_api_key: pinataApiKey,
			pinata_secret_api_key: pinataSecretApiKey
		};

		const { sizeFile} = this.state;
		this.setState({ sizeFile : files.length})
		for(let i =0;i<files.length;i++){
			let formData = new FormData();
			formData.append("file", files[i]);
			await this.onSendOneImage(formData, postHeader, recipeUrl);
		}
		
		this.setState({ loading:true});
	}
	
	// Send the json hash stored in Pinata in the smart contract MaticulmNFT
	// and mint the NFT 
	SendNFT = async() => { 
		const { hashes, hashesImage, urlPinAPI, schoolId,trainingId } = this.state;
		const { t } = this.props;
		
		let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();
		
		let annulationNotYetShown = true;
		let diplomas = { schoolId:schoolId,trainingId:trainingId,
		userAddresses: ["0x0000000000000000000000000000000000000000"]};
		
		this.context.contractNFT.methods.AddNFTsToAdressOld(hashes, diplomas)
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
		this.setState({ isButtonMetamaskVisible:true, hashes:[],hashesImage:[]});		
	}
	
	// get the decrypted PinataApiKey with the password filled
	getPinataApiKey(){
		const { paramPinataApiKey} = this.state;
		return atob(paramPinataApiKey).split(this.mdp.value)[0];
	}
	
	// get the PinataSecretApi decrypted with the password filled
	getPinataSecretApiKey(){
		const { paramPinataSecretApiKey} = this.state;
		return atob(paramPinataSecretApiKey).split(this.mdp.value)[0];		
	}
		
	render() {
		const { t } = this.props; 
		let optionTemplate = this.state.trainings.map(v => (
		  <option value={v.id}>{v.name}</option>
		));
		
		return(
		<div style={{display: 'flex', justifyContent: 'center'}}>
			<Container>
				<Form>
					<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
					</Form.Group>
					<Form.Group as={Row} >	
						<Form.Label column sm="5"><strong>{t('diplome.sendNFT')}</strong></Form.Label>						
						<Col sm="2"></Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3"></Form.Label>
					</Form.Group>
					<Form.Group as={Row} >	
						<Form.Label column sm="3">Formation</Form.Label>
						
						<Col sm="2">
						  <label>
							  <select 
								value={this.state.value} 
								onChange={this.GetValuePair.bind(this)}>
								{optionTemplate}
							  </select>
							</label>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >	
						<Form.Label column sm="3">Choisir</Form.Label>
						
						<Col sm="2">
						  <label>
							  <input type="file" id="avatar" accept="image/png, image/jpeg" 
								multiple="multiple" onChange={this.handleFile} />
							</label>
						</Col>
					</Form.Group>
					<Form.Group as={Row} >	
						<Form.Label column sm="3">{t('diplome.IPFSkey')}</Form.Label>
						
						<Col sm="2">
						  <label>
							  <Form.Control type="password" id="mdp" ref={(input) => { this.mdp = input }} />
							</label>
						</Col>
					</Form.Group>
					
					{ 
						this.state.linkVisible ? 
						<Form.Group as={Row} >	
							<Form.Label column sm="3"></Form.Label>							
							<Col sm="2">
							  <Button onClick={this.createImagePinataAxios}>{t('diplome.createNFT')}</Button>
							</Col>
						</Form.Group>
						: null
					}
					
					{ 
						this.state.loading ? 
						<Form.Group as={Row} >	
							<Form.Label column sm="3"></Form.Label>							
							<Col sm="2">
							  <label>{t('diplome.loading')}</label>
							</Col>
						</Form.Group>
						: null
					}			
					
					{ 
						this.state.isButtonMetamaskVisible ? 
						<Form.Group as={Row} >	
							<Form.Label column sm="3"></Form.Label>							
							<Col sm="2">
							  <Button onClick={this.AddInMetamask}>{t('diplome.addMetamask')}</Button>
							</Col>
						</Form.Group>
						: null
					}	
							
				</Form>
			</Container>		  
        </div>	
		);
	}
}

export default withTranslation()(OldDiplome);