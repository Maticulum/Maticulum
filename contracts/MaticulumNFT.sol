// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MaticulumNFT is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    mapping(string => uint8) hashes;
    
    constructor() ERC721("DiplomeNFT", "MTCF") {}
  
    function AddNFTToAdress(address recipient, string memory hash) public returns (uint256){
        require(hashes[hash] != 1);
        hashes[hash] = 1;
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        string memory metadata = string(abi.encodePacked("https://gateway.pinata.cloud/ipfs/", hash)); 
        _setTokenURI(newItemId, metadata);        
        return newItemId;
    }
}