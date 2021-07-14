import React from "react";


const Web3Context = React.createContext({
  web3: null,
  account: null,
  contract: null,
  contractNFT: null,
  contractSchool: null,
  contractTraining: null,
  isSuperAdmin: null
});

export default Web3Context;
