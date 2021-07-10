import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";

class Registration extends Component {
state = {isRegistered : false, isCreated: false} 
  static contextType = Web3Context; 	
 
  componentDidMount = async () => {
	const isRegistered = await this.context.contract.methods.isRegistered().call();
	if(isRegistered){
	  this.GetThisUser();
	}
	this.setState({ isRegistered: isRegistered});
  }

  GetThisUser = async() => {	  
	const user = await this.context.contract.methods.getUser().call();

	this.nameUser.value = user.name;
	this.firstnameUser.value = user.firstname;
	this.birthCountry.value = user.birthCountry;
	this.birthDate.value = user.birthDate;
	this.mail.value = user.mail;
	this.mobile.value = user.mobile;
	this.telfixe.value = user.telfixe;
  }	

  CreateModifyUser = async() => {
	const { isCreated } = this.state;
	if(!isCreated){
		await this.context.contract.methods.registerUser(
		this.nameUser.value,this.firstnameUser.value,this.birthCountry.value,
	this.birthDate.value,this.mail.value,this.mobile.value,this.telfixe.value)
		.send({from: this.context.account});
		this.state.isCreated = await this.context.contract.methods.isRegistered().call();
	}		
	else{
		await this.context.contract.methods.updateUser(
		this.nameUser.value,this.firstnameUser.value,this.birthCountry.value,
		this.birthDate.value,this.mail.value,this.mobile.value,this.telfixe.value)
		.send({from: this.context.account});
	}	  
  }	

  TestRegistration = async() => {
    const registered = await this.context.contract.methods.isRegistered().call();	  
	alert(registered);
  }		
	
  render() {
	 const { t } = this.props;  
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
          <Form.Control type="text" id="birthDate" 		  
            ref={(input) => { this.birthDate = input }}
          />	
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
                
        <Button className="next" onClick={this.GetThisUser}>Get recorded User datas</Button>
        <Button className="next" onClick={this.CreateModifyUser}>Create/Update User</Button>		
      </Form>
    );
  }
}

export default withTranslation()(Registration);