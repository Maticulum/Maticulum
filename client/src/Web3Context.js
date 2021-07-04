import React from "react";


const Web3Context = React.createContext({
  web3: null,
  contract: null,
  account: null
});

export default Web3Context;
