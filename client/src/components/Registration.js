import React, { Component, useState} from 'react';
import { Button, Form } from 'react-bootstrap';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class Registration extends Component {
state = {isRegistered : false, isCreated: false,date: new Date()} 
  static contextType = Web3Context; 	
  
 
  componentDidMount = async () => {
	const isRegistered = await this.context.contract.methods.isRegistered(this.context.account).call();
	
	this.setState({ isRegistered: isRegistered});
  }
  
  setData= (userArray, pos) => {
	let data = userArray[pos];
	alert(data);
    if(data == undefined)
		return "";
	return data;
  }

  GetThisUser = async() => {	  
	let userDatas = await this.context.contract.methods.getUserHash(this.userAddress.value).call();
	userDatas = atob(userDatas);
	let userArray = userDatas.split("#");

	this.nameUser.value = this.setData(userArray,0);
	this.firstnameUser.value = this.setData(userArray,1);
	this.birthCountry.value = this.setData(userArray,2);
	this.birthDate = this.setData(userArray,3);
	this.mail.value = this.setData(userArray,4);
	this.mobile.value = this.setData(userArray,5);
	this.telfixe.value = this.setData(userArray,6);
  }	

  CreateModifyUser = async() => {
	const { isCreated } = this.state;
	if(!isCreated){
		
		let userDatas = this.nameUser.value 	   +"#"
						+ this.firstnameUser.value +"#"
						+ this.birthCountry.value  +"#"
						+ this.birthDate           +"#"
						+ this.mail.value          +"#"
						+ this.mobile.value        +"#"
						+ this.telfixe.value       +"#";
						
		
		let userHash = btoa(userDatas);
		alert(userHash);
		
		await this.context.contract.methods.registerUserHash(this.userAddress.value,userHash).send({from: this.context.account});
		//this.state.isCreated = await this.context.contract.methods.isRegistered().call();
	}		
	else{
		await this.context.contract.methods.updateUser(
		this.nameUser.value,this.firstnameUser.value,this.birthCountry.value,
		this.birthDate.value,this.mail.value,this.mobile.value,this.telfixe.value)
		.send({from: this.context.account});
	}	  
  }	

  TestRegistration = async() => {
    const registered = await this.context.contract.methods.isRegistered(this.context.account).call();	  
	alert(registered);
  }	
  		
  render() {
	 const { t } = this.props;  
	 const { date } = this.state;
    return (
      <Form>
        <h1>Register you</h1>  
        <Form.Group>
          <Form.Label>{t('formlabel.name')}</Form.Label>
          <Form.Control type="text" id="nameUser"
            ref={(input) => { this.nameUser = input }}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>{t('formlabel.firstname')}</Form.Label>
          <Form.Control type="text" id="firstnameUser" 		  
            ref={(input) => { this.firstnameUser = input }}
          />	
        </Form.Group>
		
		<Form.Group>
          <Form.Label>Birth country</Form.Label>
          <Form.Control type="text" id="birthCountry" 		  
            ref={(input) => { this.birthCountry = input }}
          />	
        </Form.Group>
		
		<Form.Group>
          <Form.Label> {t('formlabel.birthDate')}</Form.Label>
		  <br/ >
          <DatePicker id="birthDate" selected={date} mode='default' display='default'
		  dateFormat="dd/MM/yyyy"
			onChange={ date => this.setState({ date }) } />
        </Form.Group>
		
		<Form.Group>
          <Form.Label>{t('formlabel.mail')}</Form.Label>
          <Form.Control type="text" id="mail" 		  
            ref={(input) => { this.mail = input }} 
          />	
        </Form.Group>
		
		<Form.Group>
          <Form.Label>{t('formlabel.mobilePhone')}</Form.Label>
          <Form.Control type="text" id="mobile" 		  
            ref={(input) => { this.mobile = input }}
          />	
        </Form.Group>
		
		<Form.Group>
          <Form.Label>{t('formlabel.fixedPhone')}</Form.Label>
          <Form.Control type="text" id="telfixe"
            ref={(input) => { this.telfixe = input }}
          />	
        </Form.Group>
		
		<Form.Group>
          <Form.Label>UserAddress</Form.Label>
          <Form.Control type="text" id="userAddress"
            ref={(input) => { this.userAddress = input }}
          />	
        </Form.Group>
                
        <Button className="next" onClick={this.GetThisUser}>Get recorded User datas</Button>
        <Button className="next" onClick={this.CreateModifyUser}>Create/Update User</Button>		
      </Form>
    );
  }
}

export default withTranslation()(Registration);