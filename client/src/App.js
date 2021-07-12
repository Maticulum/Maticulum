import React, { Component } from "react";
import { BrowserRouter as Router, NavLink, Switch, Route } from 'react-router-dom';
import { Button, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { withTranslation } from "react-i18next";

import getWeb3 from "./getWeb3";
import Web3Context from "./Web3Context";
import config from './config';
import Maticulum from "./contracts/Maticulum.json";

import './i18n';

import Home from './components/Home';
import Registration from './components/Registration';
import School from './components/school/School';
import Whitelisted from './components/Whitelisted';
import ImgTest from "./components/pdf/ImgTest";
import Diplome from './components/Diplome';
import DiplomeMulti from './components/DiplomeMulti';

import "./App.css";
import i18n from "./i18n";

var roles = {
   REGISTERED: 0x01,
   STUDENT: 0x02,
   SUPER_ADMIN: 0x80
}


class App extends Component {

   state = { web3: null, networkId: -1, accounts: null, contract: null,
      isRegistered: false, isStudent: false, isSuperAdmin: false };

   componentDidMount = async () => {
      try {
         // Get network provider and web3 instance.
         const web3 = await getWeb3();

         // Use web3 to get the user's accounts.
         const accounts = await web3.eth.getAccounts();

         // Get the contract instance.
         const networkId = await web3.eth.net.getId();
         const deployedNetwork = Maticulum.networks[networkId];
         const instance = new web3.eth.Contract(
            Maticulum.abi,
            deployedNetwork && deployedNetwork.address,
         );

         window.ethereum.on('accountsChanged', accounts => {
            console.log('Accounts changed ', accounts);
            this.setState({ accounts });
            
            this.init();
            if (!this.state.isRegistered) {
               window.location.assign('/registration');
            }
         });

         window.ethereum.on('chainChanged', networkId => {
            console.log('Chain changed ', networkId);
            this.setState({ networkId: parseInt(networkId) });
            this.init();
         });

         // Set web3, accounts, and contract to the state, and then proceed with an
         // example of interacting with the contract's methods.
         this.setState({ web3, networkId, accounts, contract: instance}, this.init);
      } catch (error) {
         alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
         console.error(error);
      }
   };


   init = async () => {
      const { networkId, contract } = this.state;
		
      if (networkId !== config.NETWORK_ID) {
         return;
      }

      const user = await contract.methods.getUser().call();
      if (user) {
         const isRegistered = (user.role & roles.REGISTERED) ===roles.REGISTERED;
         const isStudent = (user.role & roles.STUDENT) === roles.STUDENT;
         const isSuperAdmin = (user.role & roles.SUPER_ADMIN) === roles.SUPER_ADMIN;

         this.setState({ isRegistered, isStudent, isSuperAdmin });
         console.log(this.state);
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


   changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
   }

 
   render() {  
      if (!this.state.web3) {
         return <div>Loading Web3, accounts, and contract...</div>;
      }

      const { t } = this.props;

      const { accounts, networkId } = this.state;
      const polygon = networkId === config.NETWORK_ID;
      const connected = accounts.length > 0;
      
      return (
         <Web3Context.Provider value={{
            web3: this.state.web3,
            contract: this.state.contract,
            account: this.state.accounts[0],

            isRegistered: this.state.isRegistered, 
            isStudent: this.state.isStudent, 
            isAdmin: this.state.isAdmin, 
            isSuperAdmin: this.state.isSuperAdmin
         }} >
         <Router>
            <Navbar>
               <Navbar.Brand href='/'>Maticulum</Navbar.Brand>
               <Navbar.Collapse>
                  <Nav className='mr-auto'>
                     <NavLink className="nav-link" exact to={'/'}>{t('nav.home')}</NavLink>
                     { this.state.isSuperAdmin && <NavLink className="nav-link" visibility="hidden" to={'/whitelisted'}>{t('nav.whitelisted')}</NavLink> }
                     <NavLink className="nav-link" to={'/registration'}>{t('nav.registration')}</NavLink>
                     { this.state.isSuperAdmin && <NavLink className="nav-link" to={'/schools'}>{t('nav.schools')}</NavLink> }
                     <NavLink className="nav-link" to={'/diplome'}>{t('diplome.diploma')}</NavLink>
					 <NavLink className="nav-link" to={'/diplomeMulti'}>{t('diplome.diploma')}</NavLink>
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
                     <NavDropdown.Item onClick={() => this.changeLanguage('en')}>EN</NavDropdown.Item>
                     <NavDropdown.Item onClick={() => this.changeLanguage('fr')}>FR</NavDropdown.Item>
                  </NavDropdown>
               </Navbar.Collapse>
            </Navbar>

            <div className="main">
               <Switch>
                  <Route exact path='/' component={Home} />
                  <Route exact path='/whitelisted' component={Whitelisted} />	
                  <Route exact path='/registration' component={Registration} />
                  <Route path='/schools' component={School} /> 
                  <Route exact path='/img-test' component={ImgTest} /> 
                  <Route exact path='/diplome' component={Diplome} /> 
				  <Route exact path='/diplomeMulti' component={DiplomeMulti} /> 
               </Switch>
            </div>
         </Router>
         </Web3Context.Provider>
      );
   }
}

export default withTranslation()(App);