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
	files:null, hashes:[], pinataApiKey: '',
	pinataSecretApiKey:'',sendNFTVisibility:false, sizeFile:0, 
	gateway:null, loading:false,	jsonUrlApi:null, imageUrlAPi:null,
	paramPinataApiKey:null, paramPinataSecretApiKey:null,hashesImage:[],
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
	
	handleFile = async(e) => {
		const { files, pinataSecretApiKey, pinataApiKey, file} = this.state; 	
		let filesImages = e.target.files;
		this.setState({ files : filesImages, linkVisible:true });
	}
	
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
	
	onSendOneImage = async(formData, postHeader, recipeUrl) =>{	
		const { hashesImage, gateway } = this.state; 
		
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
		  .catch((err) => { alert(err); });
	}
	
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
	
	SendNFT = async() => { 
		const { hashes, hashesImage, urlPinAPI } = this.state;
		let pinataApiKey = this.getPinataApiKey();
		let pinataSecretApiKey = this.getPinataSecretApiKey();
		
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
						alert("ok");
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
						alert("ok");
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
	
	getPinataApiKey(){
		const { paramPinataApiKey} = this.state;
		return atob(paramPinataApiKey).split(this.mdp.value)[0];
	}
	
	getPinataSecretApiKey(){
		const { paramPinataSecretApiKey} = this.state;
		return atob(paramPinataSecretApiKey).split(this.mdp.value)[0];		
	}
		
	render() {
		const { t } = this.props; 
		
		return(
		<div style={{display: 'flex', justifyContent: 'center'}}>
		  <Card style={{ width: '50rem' }}>
            <Card.Header><strong>{t('diplome.sendNFT')}</strong></Card.Header>
            <Card.Body>			  
				<input type="file" id="avatar" accept="image/png, image/jpeg" 
				 multiple="multiple" onChange={this.handleFile} />
			</Card.Body>
			{t('diplome.IPFSkey')}
			<Form.Control type="password" id="mdp" ref={(input) => { this.mdp = input }} />
			
			{ 
				this.state.linkVisible ? 
				<Card.Body>
					<Button onClick={this.createImagePinataAxios}>{t('diplome.createNFT')}</Button>
				</Card.Body>
				: null
			}
			
			{ 
				this.state.loading ? 
				<Card.Body>
					<label>NFT building...</label>
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

export default withTranslation()(DiplomeMulti);