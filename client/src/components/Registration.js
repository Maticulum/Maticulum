import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
import Web3Context from "../Web3Context";
import { withTranslation } from "react-i18next";

class Registration extends Component {
state = {isRegistered : false} 
  static contextType = Web3Context; 	
 
  componentDidMount = async () => {
	const isRegistered = await this.context.contract.methods.isRegistered().call({from: this.context.account});
	if(isRegistered){
	  this.GetThisUser();
	}
	this.setState({ isRegistered: isRegistered});
  }

  GetThisUser = async() => {	  
	const user = await this.context.contract.methods.getUser().call({from: this.context.account});

	this.nameUser.value = user[0];
	this.firstnameUser.value = user[1];
	this.birthCountry.value = user[2];
	this.birthDate.value = user[3];	
	this.mail.value = user[5];
	this.mobile.value = user[6];
	this.telfixe.value = user[7];
		
  }	

  CreateModifyUser = async() => {
	const { isCreated } = this.state;
	if(!isCreated){
		await this.context.contract.methods.userRegister(
		this.nameUser.value,this.firstnameUser.value,this.birthCountry.value,
	this.birthDate.value,this.mail.value,this.mobile.value,this.telfixe.value)
		.send({from: this.context.account});
		this.state.isCreated = await this.context.contract.methods.isRegistered().call({from:this.context.account});
	}		
	else{
		await this.context.contract.methods.userUpdate(
		this.nameUser.value,this.firstnameUser.value,this.birthCountry.value,
		this.birthDate.value,this.mail.value,this.mobile.value,this.telfixe.value)
		.send({from: this.context.account});
	}	  
  }	

  TestRegistration = async() => {
    const registered = await this.context.contract.methods.isRegistered().call(
	{from:this.context.account});	  
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