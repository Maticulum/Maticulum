import React, { Component, useState} from 'react';
import { Button, Form, Container, Col, Row } from 'react-bootstrap';
import Web3Context from '../../Web3Context';
import { withTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DataFromBase from './DataFromBase';

class Registration extends Component {
state = {isRegistered : false, isCreated: false,date:null,userType:[],userTypeSelected:-1,
	userDatas:[]} 
  static contextType = Web3Context; 	   
 
  componentDidMount = async () => {
	const isRegistered = await this.context.contract.methods.isRegistered(this.context.account).call();	
	this.state.userType.push({name:'',id: -1});
	this.state.userType.push({name:'schoolAdmin/Jury',id: 0x03});
	this.state.userType.push({name:'Student',id: 0x01});
	this.setState({ isRegistered: isRegistered});
  }
  
  setData= (userArray, pos) => {
	let data = userArray[pos];
    if(data == undefined)
		return "";
	return data;
  }
  
  handleChange(event) {
	let val = event.nativeEvent.target.selectedIndex;
	this.state.userTypeSelected = val;
  }

  GetThisUser = async() => {
	const CryptoJS = require('crypto-js');
	const { t } = this.props;	
	try{
		if(this.pass.value == "" || this.userAddress.value == ""){
			alert(t('registration.userEmpty'));
			return;
		}
		let userDatas = await this.context.contract.methods.getUserHash(this.userAddress.value).call();
		let user = userDatas[0];
		
		if(user == ""){
			alert(t('registration.userNoreg'));
			return;
		}
		
		let datasUserUnHashed = atob(user);
		
		let decrypted = CryptoJS.TripleDES.decrypt(datasUserUnHashed, this.pass.value)
	    .toString(CryptoJS.enc.Utf8);		
		
		if(decrypted == "") alert(t('registration.wrongPass'));
		let userArray = decrypted.split("#");		

		this.nameUser.value = this.setData(userArray,0);
		this.firstnameUser.value = this.setData(userArray,1);		
		this.birthCountry.value = this.setData(userArray,2);
		this.mail.value = this.setData(userArray,4);
		this.mobilePhone.value = this.setData(userArray,5);
		this.telfixe.value = this.setData(userArray,6);
		this.state.userTypeSelected = userDatas[1];
		this.setState({ date: new Date(this.setData(userArray,3))});
	}
	catch{
		alert(t('registration.addressError'));
	}
  }	
  
  CreateModifyUser = async() => {
	if(this.userAddress.value == "") {
		alert("user adress must be filled");
		return;
	}
	const { isCreated, date } = this.state;	
	// to simulate registration in database
	DataFromBase.setDataPass(this.pass.value);
	if(!isCreated){
				
		let userDatas = this.nameUser.value 	     +"#"
						+ this.firstnameUser.value   +"#"
						+ this.birthCountry.value    +"#"
						+ date.toDateString()        +"#"
						+ this.mail.value            +"#"
						+ this.mobilePhone.value          +"#"
						+ this.telfixe.value;
								
		const CryptoJS = require('crypto-js');
	    var userDatasCrypted = CryptoJS.TripleDES.encrypt(userDatas, this.pass.value); 
		let userDatasCryptedHashed = btoa(userDatasCrypted);
				
		await this.context.contract.methods.registerUserHash(
		this.userAddress.value,userDatasCryptedHashed, this.state.userTypeSelected).send({from: this.context.account});		
	}		
	else{
		await this.context.contract.methods.updateUser(
		this.nameUser.value,this.firstnameUser.value,this.birthCountry.value,
		this.birthDate,this.mail.value,this.mobilePhone.value,this.telfixe.value)
		.send({from: this.context.account});
	}	  
  }	
  
  fillDatas = async(userAdress,name,firstname,countryBirth,birthDate,mail, phone, mobilePhone) =>{
	  const { userDatas}= this.state; 
	  let users =     name          +"#"
					+ firstname     +"#"
					+ countryBirth  +"#"
					+ birthDate     +"#"
					+ mail          +"#"
					+ phone         +"#"
					+ mobilePhone;
	  const CryptoJS = require('crypto-js');
	  var userDatasCrypted = CryptoJS.TripleDES.encrypt(users, this.pass.value); 
	  let userDatasCryptedHashed = btoa(userDatasCrypted);
	  let userHash = {hash:userDatasCryptedHashed,role:this.state.userTypeSelected,userAdress: userAdress};
	  userDatas.push(userHash);
	  this.setState({userDatas:userDatas});
  }

  showFile = async (e) => {
		const { t } = this.props; 
		if(this.pass.value == "" ) {
			alert(t('registration.passwordEmpty'));
			return;		
		}
		e.preventDefault();
		const reader = new FileReader();
		reader.onload = async (e) => { 
		  const text = (e.target.result);
		  const lines = text.split(/\r\n|\n/);		  
		  for(let i =0;i<lines.length;i++){
			const line = lines[i].split(',');
			await this.fillDatas(line[0],line[1],line[2],line[3],line[4],line[5],line[6],line[7]);
		  }
		};
		
		reader.onerror = (e) => alert(e.target.error.name);
		reader.readAsText(e.target.files[0]);				
  }  
  
  CreateModifyUsers= async() => {	  
	  const { userDatas}= this.state;
	  const { t } = this.props; 
	  await this.context.contract.methods.registerUsersHashes(userDatas).send({from: this.context.account})
	  .then(async (response) => {
		alert(t('registration.usersCreated'));
	})
	  
  }
  		
  render() {
	 const { t } = this.props;  
	 const { date } = this.state;
	 let optionTemplate = this.state.userType.map(v => (
		  <option value={v.id}>{v.name}</option>
	 ));
	 
    return (
	<Container>
      <Form> 
		<Form.Group as={Row} >	
			<Form.Label column sm="3"></Form.Label>				
			<Col sm="5">					  
			</Col>
		</Form.Group>
        <Form.Group as={Row} >	
			<Form.Label column sm="3">{t('formlabel.name')}</Form.Label>				
			<Col sm="5">	
			  <Form.Control type="text" id="nameUser"
				ref={(input) => { this.nameUser = input }}
			  />					  
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('formlabel.firstname')}</Form.Label>				
			<Col sm="5">
			  <Form.Control type="text" id="firstnameUser" 		  
            ref={(input) => { this.firstnameUser = input }}
          />					  
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('formlabel.birthCountry')}</Form.Label>				
			<Col sm="5">
			  <Form.Control type="text" id="birthCountry" 		  
            ref={(input) => { this.birthCountry = input }}
			/>					  
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('formlabel.birthDate')}</Form.Label>				
			<Col sm="5">
			  <DatePicker  id="birthDate" 
			  selected={date} mode='default' display='default'
				dateFormat="dd/MM/yyyy"
				onChange={ date => this.setState({ date }) } />		  
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('formlabel.mail')}</Form.Label>				
			<Col sm="5">
			  <Form.Control type="text" id="mail" 		  
            ref={(input) => { this.mail = input }}
			/>					  
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('formlabel.mobilePhone')}</Form.Label>				
			<Col sm="5">
			  <Form.Control type="text" id="mobilePhone" 		  
            ref={(input) => { this.mobilePhone = input }}
			/>					  
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('formlabel.fixedPhone')}</Form.Label>				
			<Col sm="5">
			  <Form.Control type="text" id="telfixe" 		  
            ref={(input) => { this.telfixe = input }}
			/>					  
			</Col>
		</Form.Group>		
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('registration.userAddress')}</Form.Label>				
			<Col sm="5">
			  <Form.Control type="text" id="userAddress" 		  
            ref={(input) => { this.userAddress = input }}
			/>					  
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('registration.userType')}</Form.Label>				
			<Col sm="5">
			  <select name="idRole" 
			    style={{width: "440px"}}
				value={this.state.value} 
				onChange={this.handleChange.bind(this)}>
				{optionTemplate}
			</select>  
			</Col>
		</Form.Group>	
		<Form.Group as={Row} >	
			<Form.Label column sm="3">{t('diplome.password')}</Form.Label>				
			<Col sm="5">
			  <Form.Control type="password" id="pass"
				ref={(input) => { this.pass = input }}
				/> 
			</Col>
		</Form.Group>
		<Form.Group as={Row} >	
			<Form.Label column sm="3">Multi users</Form.Label>				
			<Col sm="5">
			  <input type="file" onChange={(e) => this.showFile(e)} />
			</Col>
		</Form.Group>	
		<Form.Group as={Row} >
			<Form.Label column sm="3">{t('diplome.awaitedFormat')}</Form.Label>
			<Col sm="8">
				<Form.Control disabled type="text" 
				value={
					  t('registration.userAddress') + "," +
					  t('formlabel.firstname') + "," + 
					  t('formlabel.name') + "," + 
					  t('formlabel.birthCountry') + "," + 
					  t('formlabel.birthDate') + "," + 
					  t('formlabel.mail') + "," + 
					  "mobile,fixe"}
					  />
			</Col>
		</Form.Group>
                
        <Button className="next" onClick={this.GetThisUser}>{t('registration.getUser')}</Button>
        <Button className="next" onClick={this.CreateModifyUser}>{t('registration.createUser')}</Button>
		<Button className="next" onClick={this.CreateModifyUsers}>{t('registration.createUsers')}s</Button>
		<Form.Group>
          <Form.Label></Form.Label>          
        </Form.Group>
	  </Form>
	</Container>
    );
  }
}

export default withTranslation()(Registration);