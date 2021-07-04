import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import config from './config';
import Maticulum from "./contracts/Maticulum.json";

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { Button, Nav, Navbar } from 'react-bootstrap';

import Home from './components/Home';
import Example from './components/Example';
import Registration from './components/Registration';

import "./App.css";


class App extends Component {

  state = { storageValue: 0, web3: null, networkId: -1, accounts: null, contract: null };


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
      });

      window.ethereum.on('networkChanged', networkId => {
        console.log('Network changed ', networkId);
        this.setState({ networkId: parseInt(networkId) });
      });

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, networkId, accounts, contract: instance }, this.init);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  init = async () => {
    const { networkId, accounts, contract } = this.state;

    if (networkId !== config.NETWORK_ID) {
      return;
    }

    // TODO Init ...
  };


  ellipsis(s) {
    return s.substring(0, 6) + '...' + s.substring(s.length - 4, s.length);
  }


  connectPolygon = async () => {
    const { networkId, web3 } = this.state;

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
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    const { accounts, networkId } = this.state;
    const polygon = networkId === config.NETWORK_ID;
    const connected = accounts.length > 0;

    return (
      <Router>
        <Navbar>
          <Navbar.Brand href='/'>Maticulum</Navbar.Brand>
          <Navbar.Collapse>
            <Nav className='mr-auto'>
              <Nav.Link href={'/'}>Accueil</Nav.Link>
              <Nav.Link href={'/sample'}>Exemple</Nav.Link>
			  <Nav.Link href={'/Registration'}>Registration</Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end">
              <Button { ...polygon ? {} : {href: '#'}} variant={ polygon ? "outline-info" : "outline-danger" } onClick={this.connectPolygon} >
                { polygon ? config.NETWORK_NAME : 'Réseau non supporté' }
              </Button>
              <Button { ...connected ? {} : {href: '#'}} className="next" variant="outline-primary" onClick={this.connectUser}>
                { connected ? this.ellipsis(accounts[0]) : 'Connection' }
              </Button>
          </Navbar.Collapse>
        </Navbar>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route exact path='/sample'>
              <Example web3={this.state.web3} account={this.state.accounts[0]} />
          </Route>
		  <Route exact path='/Registration' component={Registration}>	
			<Registration contract={this.state.contract} account={this.state.accounts[0]} />
		  </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
