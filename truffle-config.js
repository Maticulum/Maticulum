
const HDWalletProvider = require('@truffle/hdwallet-provider');
const path = require("path");

require('dotenv').config();

module.exports = {
   // See <http://truffleframework.com/docs/advanced/configuration>
   // to customize your Truffle configuration!
   contracts_build_directory: path.join(__dirname, "client/src/contracts"),
   networks: {
      develop: {
         host: "127.0.0.1",
         port: 7545,
         network_id: 5777,
         gas: 67219750
      },
      mumbai: {
         provider: () => new HDWalletProvider([ process.env.PRIVATE_KEY ], `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`),
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
         provider: () => new HDWalletProvider([ process.env.PRIVATE_KEY ],`https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`),
         network_id:    4,       	
         confirmations: 2,
         timeoutBlocks: 200,     
         skipDryRun:    true,
         gas: 8000000 
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
