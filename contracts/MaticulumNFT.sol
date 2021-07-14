// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaticulumNFT is ERC721URIStorage, Ownable{
    constructor(string memory gatewayUrl_) ERC721("DiplomeNFT", "MTCF") {
        gatewayUrl = gatewayUrl_;
    }
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashesStored;
    string gatewayUrl;
    
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
}