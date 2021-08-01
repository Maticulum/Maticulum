## `MaticulumNFT`






### `constructor(string _gatewayUrl, string _urltoJsonApi, string _urltoImageApi, string _urlToUnPinApi, string _hashtoApikey, string _hashtoSecretApikey, string _name, string _symbol, string _hashImageToken)` (public)

Create the datas for the gateway and for the NFT




### `registerSchoolTrainingContract(address _schoolAddress, address _trainingAddress)` (public)

set the addresses of smart contracts MaticulumSchool and MaticulumTraining and 




### `setTestMode(bool _test)` (external)

To put test mode not to check if diploma is or not validated
 @param _test to decide test mode on or off




### `areDiplomasValidated(address _schoolAdmin, struct MaticulumNFT.diplomas _diplomas) → bool` (public)

check if a user 




### `isSchoolAdmin(uint256 _schoolId, address _user) → bool` (public)

check if a user is admin school




### `AddNFTsToAdress(string[] _hashes, struct MaticulumNFT.diplomas _diplomas) → uint256` (public)

Create a list of NFTs




### `AddNFTsToAdressOld(string[] _hashes, struct MaticulumNFT.diplomas _diplomas) → uint256` (public)

Create a list of NFTs




### `getlastUriId() → uint256` (public)

Get the URI of the last minted NFT




### `getURI(uint256 _id) → string` (public)

Get the URI by passing id




### `modifyGatewaysData(string _gatewayUrl, string _urltoJsonApi, string _urltoImageApi, string _urlToUnPinApi, string _hashtoApikey, string _hashtoSecretApikey)` (public)

Create the gateway datas to interact with IPFS




### `getGatewaysData() → struct MaticulumNFT.gatewayApiDatas` (public)

Get all the datas of the gateway API and the NFT token
* @return the datas



### `modifyHashToImageToken(string _hashImageToken)` (public)

Modify the hash of the stored image for the NFT token




### `getNFTDatas() → struct MaticulumNFT.NFTdatas` (public)

Get all the datas of the gateway API and the NFT token




### `getUrisByAddress(address _userAddress) → uint256[]` (public)

Get all the hashes of one user by address





### `NFTMinted(address recipient, string hash, uint256 newItemId)`





### `GatewayChanged(string gatewayUrl)`





