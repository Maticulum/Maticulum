// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaticulumNFT is ERC721URIStorage, Ownable{
    constructor(string memory _gatewayUrl, string memory _urltoJsonApi, 
                string memory _urltoImageApi, string memory _hashImageToken,
                string memory _hashtoApikey,string memory _hashtoSecretApikey) ERC721("DiplomeNFT", "MTCF") {
        gatewayUrl = _gatewayUrl;
        urltoJSonApi = _urltoJsonApi;
        urltoImageApi = _urltoImageApi;
        hashImageToken = _hashImageToken;
        hashtoApikey = _hashtoApikey;
        hashtoSecretApikey = _hashtoSecretApikey;
    }
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashesStored;
    string gatewayUrl;
    string hashImageToken;
    string urltoJSonApi;
    string urltoImageApi;
    string urltoTokenApi;
    string hashtoApikey;
    string hashtoSecretApikey;
    
    event NFTMinted(address recipient, string hash, uint256 newItemId);
    event GatewayChanged(string gatewayUrl);
  
    /**
   * @notice create a NFT
   * @param _userAddress  adress oth future owner of the NFT
   * @param _hash         hash to retrieve the JSON Metadata on IPFS
   * * @return the user address
   */
    function AddNFTToAdress(address _userAddress, string memory _hash) private returns (uint256){
        hashesStored[_hash] = 1;
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(_userAddress, newItemId);
        string memory metadata = string(abi.encodePacked(gatewayUrl, _hash)); 
        _setTokenURI(newItemId, metadata);
        
        emit NFTMinted(_userAddress, _hash, newItemId);
        return newItemId;
    }
    
    /**
   * @notice Create a list of NFTs
   * @param _userAddress  adress oth future owner of the NFT
   * @param _hashes       list of hashes to retrieve the JSON Metadata on IPFS
   * * @return the user address
   */
    function AddNFTsToAdress(address _userAddress, string[] memory _hashes) public returns (uint256){
        uint256 lastUri = 0;
        
        // temp
        
        for(uint i =0;i < _hashes.length;i++){
            require(bytes(_hashes[i]).length == 46, "Invalid hash length");
            require(hashesStored[_hashes[i]] != 1, "Hash already minted");
            // if all different else error 
        } 
        
        for(uint i = 0;i < _hashes.length;i++){
            lastUri = AddNFTToAdress(_userAddress, _hashes[i]);
        } 
        
        return lastUri; 
    }
    
    /**
   * @notice Get the gateway url to store JSON File  
   */
    function getGateway() public view returns(string memory){
        return gatewayUrl;
    }
    
    /**
   * @notice Set a different gateway url to store NFT JSON File
   * @param _gatewayUrl    gateway URL  
   */
    function changeGateway(string memory _gatewayUrl) public onlyOwner{
        gatewayUrl = _gatewayUrl;
    }
    
    /**
   * @notice Get the URI of the last minted NFT
   * @return the user address
   */
    function getlastUriId() public view returns(uint256){
        return _tokenIds.current();
    }
    
   /**
   * @notice Get the URI by passing id
   * @param _id    id of the URI stored in blockchain
   * @return the user address
   */
    function getURI(uint256 _id) public view returns(string memory){
        require(_tokenIds.current() >= _id,"Uri not yet stored");
        return tokenURI(_id);
    }
    
    /**
   * @notice Get the URL of the image of the token 
   * @return the url address
   */
    function getIPFSImageToken() view public returns(string memory){
        return string(abi.encodePacked(gatewayUrl, hashImageToken));
    }
    
    /**
   * @notice Modify the hash of the image
   * @param _hashImageToken   hash of the token image
   */
    function changeIPFSImageToken(string memory _hashImageToken) public {
        hashImageToken = _hashImageToken;
    }
    
    /**
   * @notice Get the URL of the JSON API 
   * @return the url address
   */
    function getUrlToJsonAPI() view public returns(string memory){
        return urltoJSonApi;
    }
    
    /**
   * @notice Modify the hash of the image
   * @param _urltoJsonApi   url to JSON API
   */
    function changeUrlToJsonAPI(string memory _urltoJsonApi) public {
        urltoJSonApi = _urltoJsonApi;
    }
    
    /**
   * @notice Get the URL of the image API 
   * @return the url address
   */
    function getUrlToImageAPI() view public returns(string memory){
        return urltoImageApi;
    }
    
    /**
   * @notice Modify the hash of the image
   * @param _urltoImageApi   url to image API
   */
    function changeUrlToImageAPI(string memory _urltoImageApi) public {
        urltoImageApi = _urltoImageApi;
    }
    
    
    /**
   * @notice Modify the hash of the image
   * @param _hashtoApikey   url to image API
   */
    function changeHashToAPIKey(string memory _hashtoApikey) public {
        hashtoApikey = _hashtoApikey;
    }
    
    /**
   * @notice get the the crypted hash to get the API key
   */
    function getHashToAPIKey() public view returns(string memory) {
        return hashtoApikey;
    }
    
    /**
   * @notice Modify the crypted hash to get the API key
   * @param _hashtoSecretApikey crypted hash to get the secret API key
   */
    function changeHashToSecretAPIKey(string memory _hashtoSecretApikey) public {
        hashtoSecretApikey = _hashtoSecretApikey;
    }
    
    /**
   * @notice get the crypted hash to get the secret API key
   */
    function getHashToSecretAPIKey() public view returns(string memory){
        return hashtoSecretApikey;
    }
    
}