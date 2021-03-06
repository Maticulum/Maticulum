
const local = {
    NETWORK_ID: 1000,
    NETWORK_NAME: 'Ganache',

    CHAIN_ID: '0x1691',
    CHAIN_NAME: 'Ganache',
    CURRENCY_NAME: 'Ether',
    CURRENCY_SYMBOL: 'ETH',
    RPC_URL: 'http://localhost:7545',
    EXPLORER_URL: ''
};

const dev = {
    NETWORK_ID: 80001,
    NETWORK_NAME: 'Polygon Mumbai',

    CHAIN_ID: '0x13881',
    CHAIN_NAME: 'Polygon Mumbai Testnet',
    CURRENCY_NAME: 'tMATIC',
    CURRENCY_SYMBOL: 'TMATIC',
    RPC_URL: 'https://rpc-mumbai.matic.today',
    EXPLORER_URL: 'https://matic.network'
};

const devRinkeby = {
    NETWORK_ID: 4,
    NETWORK_NAME: 'Ethereum Rinkeby',

    CHAIN_ID: '0x4',
    CHAIN_NAME: 'Ethereum Rinkeby Testnet',
    CURRENCY_NAME: 'Ether',
    CURRENCY_SYMBOL: 'ETH',
    RPC_URL: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    EXPLORER_URL: 'https://rinkeby.etherscan.io/'
};

const prod = {
    NETWORK_ID: 137,
    NETWORK_NAME: 'Polygon',

    CHAIN_ID: '0x89',
    CHAIN_NAME: 'Polygon Mainnet',
    CURRENCY_NAME: 'MATIC',
    CURRENCY_SYMBOL: 'MATIC',
    RPC_URL: 'https://rpc-mainnet.matic.network',
    EXPLORER_URL: 'https://polygonscan.com'
};


const config = {
    // common config

    ...(process.env.REACT_APP_STAGE === 'prod' ? prod :
        (process.env.REACT_APP_STAGE === 'dev' ? dev : 
		(process.env.REACT_APP_STAGE === 'local' ? local : devRinkeby))),
}

export default config;

console.log('REACT_APP_STAGE = ', process.env.REACT_APP_STAGE);
console.log('config = ', config);
