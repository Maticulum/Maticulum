// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaticulumNFT is ERC721URIStorage, Ownable{
    constructor(string memory gatewayUrl_) ERC721("DiplomeNFT", "MTCF") {
        gatewayUrl = gatewayUrl_;
    }
    // to do tests et méthode pour aller chercher geturi voir si appel plutôt depuis le contract que depuis Maticulum
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashesStored;
    uint256 lastId;
    string gatewayUrl;
    
    event NFTMinted(address recipient, string hash, uint256 newItemId);
    event GatewayChanged(string gatewayUrl);
  
    function AddNFTToAdress(address recipient, string memory hash) private returns (uint256){
        hashesStored[hash] = 1;
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        lastId = newItemId;
        string memory metadata = string(abi.encodePacked(gatewayUrl, hash)); 
        _setTokenURI(newItemId, metadata);
        
        emit NFTMinted(recipient, hash, newItemId);
        return newItemId;
    }
    
    function AddNFTsToAdress(address recipient, string[] memory hashes) public returns (uint256){
        uint256 lastUri = 0;
        
        for(uint i =0;i < hashes.length;i++){
            require(bytes(hashes[i]).length == 46, "Invalid hash length");
            require(hashesStored[hashes[i]] != 1, "Hash already minted");
            lastUri = AddNFTToAdress(recipient, hashes[i]);
        } 
        
        return lastUri;
    }
    
    function changeGateway(string memory gatewayUrl_) public onlyOwner{
        gatewayUrl = gatewayUrl_;
    }
    
    function getlastUriId() public view returns(uint256){
        return lastId;
    }
    
    function getURI(uint256 id) public view returns(string memory){
        // test if error
        return tokenURI(id);
    }
}