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
	paramPinataApiKey:null, paramPinataSecretApiKey:null};
	
	componentDidMount = async () => {
		const { gateway, jsonUrlApi, imageUrlAPi,paramPinataApiKey,paramPinataSecretApiKey } = this.state; 
		let gatewayURL = await this.context.contractNFT.methods.getGateway().call();
		let jsonAPI = await this.context.contractNFT.methods.getUrlToJsonAPI().call();
		let imageAPI = await this.context.contractNFT.methods.getUrlToImageAPI().call();
		let paramPinataApi = await this.context.contractNFT.methods.getHashToAPIKey().call();
		let paramPinataSecretApi = await this.context.contractNFT.methods.getHashToSecretAPIKey().call();
		this.setState({ gateway : gatewayURL, jsonUrlApi: jsonAPI, imageUrlAPi: imageAPI,
		paramPinataApiKey:	paramPinataApi, paramPinataSecretApiKey:paramPinataSecretApi});
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
            //handle error here
        }); 
	 
	};
	
	AddInMetamask = async() => {
		const { accounts, contractStaking, web3, gateway } = this.state; 
		const tokenAddress = await this.context.contract.methods.nft().call();
		const tokenSymbol = 'MTCF';
		const tokenDecimals = 0;
		let tokenImage = await this.context.contractNFT.methods.getIPFSImageToken().call();

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
	
	// gestion si annulation envoi diplôme
	onSendOneImage = async(formData, postHeader) =>{	
		const { imageUrlAPi, gateway } = this.state; 
		
		axios({
		  url: imageUrlAPi,
		  method: "POST",
		  headers: postHeader,
		  data: formData,
		})
		  .then(async (res) => { 
			let ipfsHash = res.data.IpfsHash;
			let urlMetadata = gateway + ipfsHash;	
						
			this.setState({ linkDiplome : urlMetadata, linkVisible:true,
			hashImage:ipfsHash});
			await this.getJsonData(urlMetadata);
		  }) 
		  .catch((err) => { alert(err); });
	}
	
	createImagePinataAxios = async(e) => { 		
		const { files} = this.state; 		
		
		const pinataApiKey = this.getPinataApiKey();
		const pinataSecretApiKey = this.getPinataSecretApiKey();
		
		alert(pinataApiKey);
		alert(pinataSecretApiKey);
		
	    const postHeader = {
			pinata_api_key: pinataApiKey,
			pinata_secret_api_key: pinataSecretApiKey
		};


		const { sizeFile} = this.state;
		this.setState({ sizeFile : files.length})
		for(let i =0;i<files.length;i++){
			let formData = new FormData();
			formData.append("file", files[i]);
			await this.onSendOneImage(formData, postHeader);
		}
		
		this.setState({ loading:true});
	}
	
	SendNFT = async() => { 
		const { hashes, isButtonMetamaskVisible} = this.state;
		await this.context.contract.methods.createDiplomeNFTs(this.context.account,hashes).send({from:this.context.account});			
		this.setState({ isButtonMetamaskVisible : true});
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