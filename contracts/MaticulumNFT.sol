// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaticulumNFT is ERC721URIStorage, Ownable{
    constructor(string memory _gatewayUrl, string memory _urltoJsonApi, string memory _urltoImageApi, string memory _urlToPinApi,
                string memory _hashtoApikey,string memory _hashtoSecretApikey,
                string memory _hashImageToken,
                string memory name,
                string memory symbol) ERC721(name, symbol) {
        
        datas = gatewayApiDatas(_gatewayUrl, _urltoJsonApi, _urltoImageApi, _urlToPinApi, _hashtoApikey, _hashtoSecretApikey);
        NFTDatas_ = NFTdatas(name, symbol, _hashImageToken);
    }
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashesStored;
    
    struct gatewayApiDatas{
        string gatewayUrl;
        string urltoJSonApi;
        string urltoImageApi;
        string urlToPinApi;
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
        hashesStored[_hash] = 1;
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(_userAddress, newItemId);
        string memory metadata = string(abi.encodePacked(datas.gatewayUrl, _hash)); 
        _setTokenURI(newItemId, metadata);
        
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
   * @notice Create a list of NFTs
   * @param _gatewayUrl           url https of the gateway to IPFS
   * @param _urltoJsonApi         url of the API to store a json file     
   * @param _urlToPinApi          url of the API to delete a hash
   * @param _urltoImageApi        url of the API to store an image
   * @param _hashtoApikey         crypted hash to access Api key to load metadata and image 
   * @param _hashtoSecretApikey   crypted hash to access secret Api key to load metadata and image
   */
    function modifyGatewaysData(string memory _gatewayUrl, 
                string memory _urltoJsonApi,string memory _urltoImageApi,string memory _urlToPinApi,
                string memory _hashtoApikey,string memory _hashtoSecretApikey) public onlyOwner{
        datas = gatewayApiDatas(_gatewayUrl, _urltoJsonApi, _urltoImageApi, _urlToPinApi, _hashtoApikey, _hashtoSecretApikey);
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
        NFTDatas_.hashImageToken = _hashImageToken;
    }
    
     /**
   * @notice Get all the datas of the gateway API and the NFT token
   * * @return the datas
   */
    function getNFTDatas() public view returns(NFTdatas memory){
        return NFTDatas_;
    }
}