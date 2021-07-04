import React, { Component } from 'react';

class Example extends Component {

    constructor(props) {
        super(props);

        this.web3 = props.web3;
        this.account = props.account;
    }

  render() {
    return (
        <div className="App">
            Adresse = {this.account}
        </div>
    );
  }
}

export default Example;
