// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaticulumNFT is ERC721URIStorage, Ownable{
    
     /**
   * @notice Create the datas for the gateway and for the NFT
   * @param _gatewayUrl           url https of the gateway to IPFS
   * @param _urltoJsonApi         url of the API to store a json file     
   * @param _urlToUnPinApi        url of the API to delete a hash
   * @param _urltoImageApi        url of the API to store an image
   * @param _hashtoApikey         crypted hash to access Api key to load metadata and image 
   * @param _hashtoSecretApikey   crypted hash to access secret Api key to load metadata and image
   * @param _hashImageToken   crypted hash to access secret Api key to load metadata and image
   * @param _name   crypted hash to access secret Api key to load metadata and image
   * @param _symbol   crypted hash to access secret Api key to load metadata and image
   */
    constructor(string memory _gatewayUrl, string memory _urltoJsonApi, string memory _urltoImageApi, string memory _urlToUnPinApi,
                string memory _hashtoApikey,string memory _hashtoSecretApikey,
                string memory _name,
                string memory _symbol,
                string memory _hashImageToken) ERC721(_name, _symbol) {
        
        datas = gatewayApiDatas(_gatewayUrl, _urltoJsonApi, _urltoImageApi, _urlToUnPinApi, _hashtoApikey, _hashtoSecretApikey);
        NFTDatas_ = NFTdatas(_name, _symbol, _hashImageToken);
    }
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => bool) hashesStored;
    mapping(string => bool) hashesStoredTemporary;
    mapping(address=>uint[]) hashesByUser;
    uint[] tokenIdUser;
    uint256 maxHashCount = 200;
    
    struct gatewayApiDatas{
        string gatewayUrl;
        string urltoJSonApi;
        string urltoImageApi;
        string urlToUnPinApi;
        string hashtoApikey;
        string hashtoSecretApikey;
    }
    
    struct NFTdatas{
        string name;
        string symbol;
        string hashImageToken;
    }
    
    gatewayApiDatas datas;
    NFTdatas NFTDatas_;
    
    event NFTMinted(address recipient, string hash, uint256 newItemId);
    event GatewayChanged(string gatewayUrl);
  
    /**
   * @notice create a NFT
   * @param _userAddress  adress oth future owner of the NFT
   * @param _hash         hash to retrieve the JSON Metadata on IPFS
   * * @return the user address
   */
    function AddNFTToAdress(address _userAddress, string memory _hash) private returns (uint256){
        
        hashesStored[_hash] = true;
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(_userAddress, newItemId);
        string memory metadata = string(abi.encodePacked(datas.gatewayUrl, _hash)); 
        _setTokenURI(newItemId, metadata);
        
        hashesByUser[_userAddress].push(newItemId);
        
        emit NFTMinted(_userAddress, _hash, newItemId);
        return newItemId;   
    }
    
    /**
   * @notice Create a list of NFTs
   * @param _userAddress  adress of the future owner of the NFT
   * @param _hashes       list of hashes to retrieve the JSON Metadata on IPFS
   * * @return the user address
   */
    function AddNFTsToAdress(address _userAddress, string[] memory _hashes) public returns (uint256){
        require(_hashes.length <= maxHashCount, "Gaz limit security");
       
        uint256 lastUri = 0;
        
        for(uint i =0;i < _hashes.length;i++){
            require(!hashesStoredTemporary[_hashes[i]], "Hash already in the list");
            require(bytes(_hashes[i]).length == 46, "Invalid hash length");
            require(!hashesStored[_hashes[i]], "Hash already minted");
            hashesStoredTemporary[_hashes[i]] = true;
        } 
        
        for(uint i = 0;i < _hashes.length;i++){
            delete hashesStoredTemporary[_hashes[i]];
            lastUri = AddNFTToAdress(_userAddress, _hashes[i]);
        } 
        
        return lastUri; 
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
   * @notice Create the gateway datas to interact with IPFS
   * @param _gatewayUrl           url https of the gateway to IPFS
   * @param _urltoJsonApi         url of the API to store a json file     
   * @param _urlToUnPinApi          url of the API to delete a hash
   * @param _urltoImageApi        url of the API to store an image
   * @param _hashtoApikey         crypted hash to access Api key to load metadata and image 
   * @param _hashtoSecretApikey   crypted hash to access secret Api key to load metadata and image
   */
    function modifyGatewaysData(string memory _gatewayUrl, 
                string memory _urltoJsonApi,string memory _urltoImageApi,string memory _urlToUnPinApi,
                string memory _hashtoApikey,string memory _hashtoSecretApikey) public onlyOwner{
        datas = gatewayApiDatas(_gatewayUrl, _urltoJsonApi, _urltoImageApi, _urlToUnPinApi, _hashtoApikey, _hashtoSecretApikey);
    }
    
    /**
   * @notice Get all the datas of the gateway API and the NFT token
   * * @return the datas
   */
    function getGatewaysData() public view returns(gatewayApiDatas memory){
        return datas;
    }
    
     /**
   * @notice Modify the hash of the stored image for the NFT token
   * @param _hashImageToken       hash of the image
   */
    function modifyHashToImageToken(string memory _hashImageToken) public onlyOwner{
        require(bytes(_hashImageToken).length == 46, "Invalid hash length");
        NFTDatas_.hashImageToken = _hashImageToken;
    }
    
     /**
   * @notice Get all the datas of the gateway API and the NFT token
   * * @return the datas
   */
    function getNFTDatas() public view returns(NFTdatas memory){
        return NFTDatas_;
    }
    
    /**
   * @notice Get all the hashes of one user by address
   * * @param _userAddress       address of the user
   * * @return the datas
   */
    function getUrisByAddress(address _userAddress) public view returns(uint[] memory){
        return hashesByUser[_userAddress];
    }
}