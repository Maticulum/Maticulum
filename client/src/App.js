import React, { Component } from "react";
import { BrowserRouter as Router, NavLink, Switch, Route } from 'react-router-dom';
import { Alert, Button, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import getWeb3 from "./getWeb3";
import Web3Context from "./Web3Context";
import config from './config';
import Maticulum from "./contracts/Maticulum.json";
import MaticulumNFT from "./contracts/MaticulumNFT.json";
import MaticulumSchool from "./contracts/MaticulumSchool.json";
import MaticulumTraining from "./contracts/MaticulumTraining.json";

import './i18n';

import Home from './components/Home';
import Registration from './components/user/Registration';
import SchoolList from './components/school/SchoolList';
import SchoolItem from './components/school/SchoolItem';
import AdminValidation from './components/school/AdminValidation';
import Training from './components/training/Training';
import TrainingChoice from './components/training/TrainingChoice';
import RegistrationValidation from './components/training/RegistrationValidation';
import TrainingValidation from './components/training/TrainingValidation';
import JuryValidation from './components/training/JuryValidation';
import Whitelisted from './components/user/Whitelisted';
import Diplome from './components/diplomas/Diplome';
import OldDiplome from './components/diplomas/OldDiplome';
import ShowDiplomas from './components/diplomas/ShowDiplomas';
import MultiDiplomes from './components/diplomas/MultiDiplomes';
import AdminSetPinataData from './components/diplomas/AdminSetPinataData';

import "./App.css";
import i18n from "./i18n";


var roles = {
   REGISTERED: 0x01,
   VALIDATED: 0x02,
   SUPER_ADMIN: 0x80
}


class App extends Component {

   state = { web3: null, networkId: -1, accounts: null, contract: null, contractNFT: null,
      isRegistered: false, isValidated: false, isSuperAdmin: false };

   componentDidMount = async () => {
      try {
         // Get network provider and web3 instance.
         const web3 = await getWeb3();

         // Use web3 to get the user's accounts.
         const accounts = await web3.eth.getAccounts();

         // Get the contract instance.
         const networkId = await web3.eth.net.getId();
         const deployedNetwork = Maticulum.networks[networkId];
         const instance = new web3.eth.Contract(Maticulum.abi, deployedNetwork && deployedNetwork.address,);
		 const instanceNFT = new web3.eth.Contract(MaticulumNFT.abi, deployedNetwork && MaticulumNFT.networks[networkId].address);
         const instanceSchool = new web3.eth.Contract(MaticulumSchool.abi, deployedNetwork && MaticulumSchool.networks[networkId].address);
         const instanceTraining = new web3.eth.Contract(MaticulumTraining.abi, deployedNetwork && MaticulumTraining.networks[networkId].address);

         window.ethereum.on('accountsChanged', accounts => {
            console.log('Accounts changed ', accounts);
            window.location.href='/';
         });

         window.ethereum.on('chainChanged', networkId => {
            console.log('Chain changed ', networkId);
            window.location.href='/';
         });

         // Set web3, accounts, and contract to the state, and then proceed with init
         this.setState({ web3, networkId, accounts, contract: instance, contractNFT: instanceNFT,
            contractSchool: instanceSchool, contractTraining: instanceTraining}, this.init);
      } catch (error) {
         alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
         console.error(error);
      }
   };


   init = async () => {
      const { networkId, accounts, contract } = this.state;
		
      if (networkId !== config.NETWORK_ID) {
         return;
      }

      const user = await contract.methods.users(accounts[0]).call();
      if (user) {
         const isRegistered = (user.role & roles.REGISTERED) === roles.REGISTERED;
         const isValidated = (user.role & roles.VALIDATED) === roles.VALIDATED;
         const isSuperAdmin = (user.role & roles.SUPER_ADMIN) === roles.SUPER_ADMIN;

         const schools = await this.state.contractSchool.methods.getAdministratorSchools(accounts[0]).call();
         const isSchoolAdmin = schools.length > 0;

         this.setState({ isRegistered, isValidated, isSuperAdmin, isSchoolAdmin });
      }
   };


   getEllipsis = (s) => {
      if (s === null || s.length < 10) {
         return s;
      }

      return s.substring(0, 6) + '...' + s.substring(s.length - 4, s.length);
   }


   connectPolygon = async () => {
      const { networkId } = this.state;

      if (networkId !== config.NETWORK_ID) {
         const data = [{
            chainId: config.CHAIN_ID,
            chainName: config.CHAIN_NAME,
            nativeCurrency: {
               name: config.CURRENCY_NAME,
               symbol: config.CURRENCY_SYMBOL,
               decimals: 18
            },
            rpcUrls: [ config.RPC_URL ],
            blockExplorerUrls: [ config.EXPLORER_URL ]
         }];
   
         await window.ethereum.request({ method: 'wallet_addEthereumChain', params: data });
      }
   }


   connectUser = async () => {
      await window.ethereum.enable();
   }

 
   render() {
      const { t } = this.props;

      if (!this.state.web3) {
         return <div>Loading Web3, accounts, and contract...</div>;
      }

      if (this.state.networkId !== config.NETWORK_ID) {
         return <Container>
            <Alert variant="danger">
               <Alert.Heading>{t('error.badNetworkTitle')}</Alert.Heading>
               {t('error.badNetwork')} {config.NETWORK_NAME}
            </Alert>
         </Container>;
      }

      const { accounts, networkId } = this.state;
      const polygon = networkId === config.NETWORK_ID;
      const connected = accounts.length > 0;
      
      return (
         <Web3Context.Provider value={{
            web3: this.state.web3,
            contract: this.state.contract,
            account: this.state.accounts[0],
			contractNFT: this.state.contractNFT,
            contractSchool: this.state.contractSchool,
            contractTraining: this.state.contractTraining,
            isSuperAdmin: this.state.isSuperAdmin
         }} >
		 
			<Router>
			<div className='maticulum'> 
				<Navbar bg="purple" variant="white">
				   
				   <Navbar.Brand href='/' className='maticulum'>
						
				   </Navbar.Brand>
				   <Navbar.Collapse>
					  <Nav>
						 <NavLink className="nav-link" exact to={'/'}>
							<img src="https://gateway.pinata.cloud/ipfs/QmP4xzubJh8auv9NgYDP75b9ms9NDjwYVTJxkPNMddNWok" />
						 </NavLink>
						 <NavLink className="nav-link" exact to={'/'}>
							<div>Maticulum</div>
						 </NavLink>
						 { this.state.isSchoolAdmin && <NavLink className="nav-link" to={'/registration'}>{t('nav.registration')}</NavLink> }
						 { this.state.isValidated && <NavLink className="nav-link" to={'/schools/new'}>{t('nav.createSchool')}</NavLink> }
						 { this.state.isSuperAdmin && <NavLink className="nav-link" visibility="hidden" to={'/whitelisted'}>{t('nav.whitelisted')}</NavLink> }
						 { this.state.isSuperAdmin && <NavLink className="nav-link" to={'/schools'}>{t('nav.schools')}</NavLink> }
						 { this.state.isSchoolAdmin && <NavLink className="nav-link" to={'/trainings/choice'}>{t('nav.training')}</NavLink> }
						 { this.state.isSchoolAdmin && <NavLink className="nav-link" to={'/oldDiplome'}>{t('nav.oldDiplomas')}</NavLink> }
						 { this.state.isSchoolAdmin && <NavLink className="nav-link" to={'/diplome'}>{t('nav.createDiploma')}</NavLink> }
						 { this.state.isSchoolAdmin && <NavLink className="nav-link" to={'/MultiDiplomes'}>{t('nav.createDiplomas')}</NavLink> }
						 <NavLink className="nav-link" to={'/showDiplomas'}>{t('nav.searchDiplomas')}</NavLink>
					  </Nav>
				   </Navbar.Collapse>
				   <Navbar.Collapse className="justify-content-end">
					  <Button { ...polygon ? {} : {href: '#'}} variant={ polygon ? "outline-info" : "outline-danger" } onClick={this.connectPolygon} >
						 { polygon ? config.NETWORK_NAME : 'Réseau non supporté' }
					  </Button>
					  <Button { ...connected ? {} : {href: '#'}} className="next" variant="outline-primary" onClick={this.connectUser}>
						 { connected ? this.getEllipsis(accounts[0]) : 'Connection' }
					  </Button>
					  <NavDropdown title={i18n.language.toUpperCase()} id="language">
						 <NavDropdown.Item onClick={() => i18n.changeLanguage('en')}>EN</NavDropdown.Item>
						 <NavDropdown.Item onClick={() => i18n.changeLanguage('fr')}>FR</NavDropdown.Item>
					  </NavDropdown>					  
				   </Navbar.Collapse>
				</Navbar>
			</div>
            <div className="main">
               <Switch>
                  <Route exact path='/' component={Home} />
                  <Route exact path='/whitelisted' component={Whitelisted} />	
                  <Route exact path='/registration' component={Registration} />
                  
                  <Route exact path='/schools' component={ SchoolList} />
                  <Route path='/schools/:schoolId/trainings/:trainingId' component={ Training } />
                  <Route path='/schools/:schoolId/validation' component={ AdminValidation } />
                  <Route path='/schools/:schoolId' component={ SchoolItem } />

                  <Route exact path='/trainings/choice' component={ TrainingChoice } />
                  <Route path='/trainings/:trainingId/jury' component={ JuryValidation } />
                  <Route path='/trainings/:trainingId/registration' component={ RegistrationValidation } />
                  <Route path='/trainings/:trainingId/validation' component={ TrainingValidation } />

                  <Route exact path='/diplome' component={Diplome} /> 
				  <Route exact path='/oldDiplome' component={OldDiplome} /> 
				  <Route exact path='/showDiplomas' component={ShowDiplomas} /> 
				  <Route exact path='/MultiDiplomes' component={MultiDiplomes} /> 
				  <Route exact path='/adminSetPinataData' component={AdminSetPinataData} />
               </Switch>
            </div>
			</Router>
		 
         
         </Web3Context.Provider>
      );
   }
}

export default withTranslation()(App);