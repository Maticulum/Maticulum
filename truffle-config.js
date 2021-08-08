
const HDWalletProvider = require('@truffle/hdwallet-provider');
const path = require("path");

require('dotenv').config();
let key = 'any unfold saddle alarm stereo valve aware grocery usual south write urge';
let infura = 'https://polygon-mumbai.infura.io/v3/bdb1342e6ef64b56a79632b64fbcd464';
let infuraRinkeby = 'https://rinkeby.infura.io/v3/7f1b18274af4462cbf7ad68d64362c33';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      host: "localhost",
      port: 7545,
      network_id: 1000,
      gas:67219750 , // Ropsten has a lower block limit than mainnet
      gasPrice: 20000000000,	// <-- Use this low gas price
    },
    mumbai: {
      provider: () => new HDWalletProvider(key, `https://rpc-mumbai.matic.today`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    matic: {
      provider: () => new HDWalletProvider([ process.env.PRIVATE_KEY ], `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
	rinkeby: {
      provider: () => new HDWalletProvider(key,infuraRinkeby),
      network_id:    4,       // Ropsten's id
      gas:           8000000, // Ropsten has a lower block limit than mainnet
      gasPrice: 20000000000,	// <-- Use this low gas price
	  confirmations: 2,       // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun:    true     // Skip dry run before migrations? (default: false for public nets )
    }, 
  },
   compilers: {
      solc: {
         version: "0.8.4",
         settings: {
            optimizer: {
               enabled: false,
               runs: 200
            },
         }
      }
   }
};
