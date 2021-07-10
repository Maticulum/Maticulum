// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MaticulumNFT is ERC721URIStorage, Ownable{
    constructor() ERC721("DiplomeNFT", "MTCF") {}
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashes;
    uint256 lastId;
    string gatewayAddress = "https://gateway.pinata.cloud/ipfs/";
    
    event NFTMinted(address recipient, string hash, uint256 newItemId);
  
    function AddNFTToAdress(address recipient, string memory hash) public returns (uint256){
        require(hashes[hash] != 1, "Hash already minted");
        hashes[hash] = 1;
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        lastId = newItemId;
        string memory metadata = string(abi.encodePacked(gatewayAddress, hash)); 
        _setTokenURI(newItemId, metadata);
        
        emit NFTMinted(recipient, hash, newItemId);
        return newItemId;
    }
    
    function changeGateway(string memory gatewayAddress_) public onlyOwner{
        gatewayAddress = gatewayAddress_;
    }
    
    function getlastUriId() public view returns(uint256){
        return lastId;
    }
}