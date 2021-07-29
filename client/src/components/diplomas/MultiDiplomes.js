import React, { Component } from "react";
import { SectionList,Button, Card, Form, Container, Row, Col } from 'react-bootstrap';
import Web3Context from '../../Web3Context';
import { withTranslation } from "react-i18next";
import background from '../pdf/assets/background.jpg';
import axios from "axios";
import DataFromBase from '../user/DataFromBase';
import ListGroup from 'react-bootstrap/ListGroup';

// TODO : permettre de charger un prédiplôme avec le user donné enregistré par un admin
// et une école donnée écran préalable à la création de diplôme 
// ou plutôt dans la page liste de user, liste d'école/formation du user
// préchargement des données
// admin formation peut saisir adresse avec mdp et récupérer nom prénom + ecole niveau 
class Diplome extends Component {
	static contextType = Web3Context;
	
	state = { linkDiplome : 'Diplome', linkVisible:false,
	hashImage:null,hashJson:null,fileToUpload:null, isButtonMetamaskVisible : false,
	showDownload: false, firstname: '', lastname: '', school : '', formData:null,
	grade:'',diplomaName:'',files:[], sendNFT:false, hashes:[], sizeFile:0,
	loading:false, gateway:null, jsonUrlApi:null, imageUrlAPi:null,
	paramPinataApiKey:null, paramPinataSecretApiKey:null, hashesImage:[],
	urlPinAPI:null, descriptions:[],names:[],
	trainingUsers:[], schoolId:null,trainingId:null,
	usersValues:[]};
		
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
		
		for(let i = 0;i<trainingsCount;i++){			
			let training = await this.context.contractTraining.methods.trainings(i).call();			
			trainingsAll.push({name:training[1],id: i});
		}
		
		this.setState({ gateway : gatewayURL, 
		jsonUrlApi: jsonAPI, imageUrlAPi: imageAPI,urlPinAPI:pinAPI,
		paramPinataApiKey:paramPinataApi, paramPinataSecretApiKey:paramPinataSecretApi,
		trainingUsers:trainingsAll
		});
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
	
	// Send the JSON file hash to Pinata API with as image the link 
	// created with the pinate API image hash response 
	getJsonData = async (linkDiplome, hashes, nameJson, descriptionJson ) => {
		const { hashJson, sendNFTVisibility, sizeFile, 
				loading, gateway, jsonUrlApi, revert} = this.state; 				
		const { t } = this.props;  
						
		const data ={ 
			"name": t('diplome.jsonName') + " : " + nameJson,
			"image": linkDiplome,
			"description": descriptionJson + ". " + t('diplome.description')
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
			alert(error);
        }); 
	 
	};
	
	checkDiplomaValidationState= async() =>{
		
	}
	
	// create the images in the canvas web page
	createImageDiplome = async(firstname, lastname,school, grade, diplomaName) => {
		const { files,names, descriptions  } = this.state; 
		const { t } = this.props;
		
		names.push(t('diplome.diplomaof')  + firstname + " " + lastname); 
		descriptions.push(grade + t('diplome.of') + diplomaName + t('diplome.awardedDiploma') + school);
		
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
	
	// create the image in the page	with the datas loaded from file or the page
	onCreateDiplome = async() => {
		const { files, usersValues } = this.state; 	
		this.setState({ showDownload: true });  
		for(let i = 0;i<usersValues.length;i++){
			let firstname = usersValues[i].firstname;
			let lastname = usersValues[i].lastname;
			let school = usersValues[i].school;
			let grade = usersValues[i].grade;
			let diplomaName = usersValues[i].diplomaName;
			
			await this.createImageDiplome(firstname, lastname,school,grade, diplomaName);
		}
	}
	
	// erase all datas to send a new NFT or list of NFTs
	clearDiplomas = async() =>  {
		const { linkVisible,isButtonMetamaskVisible, hashes,hashesImage} = this.state;
		document.getElementById('diplomaImage').innerHTML = "";			
		
		this.setState({ linkVisible:false,isButtonMetamaskVisible:false, 
		hashes:[],hashesImage:[],isButtonMetamaskVisible:false, files:[], usersValues:[],
		schoolId:null,trainingId:null });
	}
	
	// send one image to dedicated Pinata API 
	onSendOneImage = async(formData, recipeUrl, postHeader, hashes, hashesImage,
	nameJson, descriptionJson	) => {	
	    const { gateway } = this.state; 
		const { t } = this.props; 
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
		    await this.getJsonData(urlMetadata, hashes, nameJson, descriptionJson);			
	    }) 
	    .catch((err) => { 
		   alert(t('diplome.errorSendingNFT') + err); 
	    });
	}
	
	// Take the files created with images to send then to Pinata
	createImagePinataAxios = async(e) => {		
		const { formData, linkDiplome, files, imageUrlAPi, hashes, hashesImage,
		names, descriptions } = this.state; 
		
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
			let nameJson = names[i];
			let descriptionJson = descriptions[i];
			await this.onSendOneImage(formData, recipeUrl, postHeader, hashes, hashesImage,
			nameJson, descriptionJson);
		}
		
		this.setState({ loading:true});
	}
	
	setData= (userArray, pos) => {
		let data = userArray[pos];
		if(data == undefined)
			return "";
		return data;
	  }
	
	// Send the json hash stored in Pinata in the smart contract MaticulmNFT
	// and mint the NFT 
	SendNFTToSmartContract = async() => {
		const { hashes, hashesImage, urlPinAPI, schoolId, trainingId, usersValues } = this.state; 
		const { t } = this.props;
						
		let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();		
		
		let annulationNotYetShown = true;
		let diplomas = { schoolId:schoolId,trainingId:trainingId,
		userAddresses: ["0xc50405e65d9826242f3e338b6eFC81d463b4d26A"]};
				
		this.context.contractNFT.methods.AddNFTsToAdress(hashes, diplomas)
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
		
		await this.clearDiplomas();
	}
	
	// To add the symbolNFT in Metamask with one image
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
	
	GetValuePair = async (event) => {
		var index = event.nativeEvent.target.selectedIndex;
		let trainingId = event.nativeEvent.target[index].value;
		let trainingsUsersCount = await this.context.contractTraining.methods.getUsersCountForTraining(trainingId).call();
		let training = await this.context.contractTraining.methods.trainings(trainingId).call();
		let schools = await this.context.contractSchool.methods.schools(training[0]).call();
		let users = [];

		for(let i = 0;i<trainingsUsersCount;i++){			
			let userAddress = await this.context.contractTraining.methods.getUserForTraining(trainingId,i).call();	
			let isValidated = await this.context.contractTraining.methods.diplomaValidated(userAddress, trainingId).call();
			alert(userAddress);
			if(isValidated) {
				
				const CryptoJS = require('crypto-js');
				let userDatas = await this.context.contract.methods.getUserHash(userAddress).call();
				let user = userDatas[0];
				let datasUserUnHashed = atob(user);
				
				let decrypted = CryptoJS.TripleDES.decrypt(datasUserUnHashed, this.tbxPass.value)
				.toString(CryptoJS.enc.Utf8);	
				
				if(decrypted == "") alert("Wrong password");
				let userArray = decrypted.split("#");
				
				
				users.push({firstname : this.setData(userArray,1), 
							lastname : this.setData(userArray,0),
							school : schools[0],
							grade:training[2],
							diplomaName:training[1],
							userAddress:userAddress});
				
			}
		}
		
		this.setState({usersValues: users, schoolId:training[0],trainingId: trainingId});			
	}
	
	render() {
		const { t } = this.props; 
		let optionTemplate = this.state.trainingUsers.map(v => (
		  <option value={v.id}>{v.name}</option>
		));
		
		return(
		<div style={{display: 'flex', justifyContent: 'center'}}>
			<Container>
				<Form>
					<Form.Group as={Row} >	
						<Form.Label column sm="3">{t('diplome.password')}</Form.Label>
						
						<Col sm="2">
						  <Form.Control type="password" 
						  id="tbxPass" ref={(input) => { this.tbxPass = input }}
						  />
						</Col>
					</Form.Group>
					<Form.Group as={Row} >
						<Form.Label column sm="3">{t('training.training')}(s)</Form.Label>
						<Col sm="9">
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