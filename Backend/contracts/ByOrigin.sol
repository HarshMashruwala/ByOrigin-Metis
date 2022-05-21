// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ByOrigin is Ownable {
    address private admin;
    struct IssuerRequest {
        address issuerAddress;
        string issuerCID;
        bool approval; 
    }
    struct IssuerContract {
        address contractaddress;
        string contractName;
        uint256 requestIndex;
        string contractType;
    }
    struct IssuerContractArray {
        IssuerContract[] contractArray;
    }
    IssuerRequest[] public issuerRequest;
    uint256 public approvalCounts;
    mapping(address=>IssuerContractArray) issuerListOfContract;
    mapping(address=>bool) public issuerAddress;
    
    constructor() {
        admin = msg.sender;
    }

    function applyForRequest(string memory _issuerCID) public {
        require(!issuerAddress[msg.sender],'Alaredy register as Issuer.');
        issuerRequest.push(IssuerRequest({
            issuerAddress:msg.sender,
            issuerCID:_issuerCID,
            approval:false
        }));
        issuerAddress[msg.sender] = true;
    }

    function approveRequest(uint256 _index) public {
        require(issuerRequest[_index].approval == false, 'Issuer request already approved.');
        issuerRequest[_index].approval = true;
        approvalCounts = approvalCounts + 1;
    }

    function issuerRequestCount() public view returns (uint256 result)  {
        uint256 length = issuerRequest.length;
        return length;
    }

    function getOwnerContract(address _issuerAddress) public view returns(IssuerContract[] memory) {
        return(issuerListOfContract[_issuerAddress].contractArray);
    }

    function createNewContract(uint256 _index,string memory _contractType,string memory _contractName) public {
        require(issuerRequest[_index].issuerAddress == msg.sender && issuerRequest[_index].approval == true,'Issuer Request is not approved.');
        address newContract = address(new physicalProduct(msg.sender));
        
        issuerListOfContract[msg.sender].contractArray.push(IssuerContract({
            contractaddress:newContract,
            contractName:_contractName,
            requestIndex: _index,
            contractType: _contractType
        }));
    }
}

contract physicalProduct is Ownable,ERC721,ERC721Enumerable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Claimer {
        string secretPassword;
        string secretPin;
        address claimerAddress;
        bool claimStatus;
        string email;
    }
    address admin;
    mapping(uint256=>Claimer) tokenIdToClaimer;
    mapping(uint256 => string) private _tokenURIs;
   

    constructor(address issuerAddress) ERC721('Physical Certificate NFT','PCN'){
        admin = issuerAddress;
    }
    modifier restricted() {
        require(admin == msg.sender);
        _;
    }

    function mint(string memory _secretPassword,string memory _secretPin,string memory _tokenURI) public payable restricted returns(uint256){
        require(msg.value >= 0.01 ether, 'Require minimum minting amount.');
        uint256 _newTokenId = _tokenIds.current();
        _mint(msg.sender,_newTokenId);
        _tokenIds.increment();
        _setTokenURI(_newTokenId, _tokenURI);
        setClaimerDetail(_secretPassword,_secretPin,_newTokenId,'');
        
        return _newTokenId;
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function setClaimerDetail(string memory _secretPassword,string memory _secretPin,uint256 _tokenId,string memory _email) internal {
        Claimer memory newClaimerDetails = Claimer({
            secretPassword:_secretPassword,
            secretPin:_secretPin,
            claimerAddress: address(0x00),
            claimStatus:false,
            email:_email
        });
        tokenIdToClaimer[_tokenId] = newClaimerDetails;

    }

    function claimProduct(uint256 _tokenId,string memory _secretPassword,string memory _secretPin,string memory _email) public returns (bool result){
        require(_exists(_tokenId), 'This Tokenid not exists.');
        require(tokenIdToClaimer[_tokenId].claimStatus == false, 'This product alredy claimed.');
        require((keccak256(abi.encodePacked(tokenIdToClaimer[_tokenId].secretPassword)) == keccak256(abi.encodePacked(_secretPassword)) && keccak256(abi.encodePacked(tokenIdToClaimer[_tokenId].secretPin)) == keccak256(abi.encodePacked(_secretPin))), 'This claimer is not authorize to claim certificate.');
        _transfer(admin, msg.sender, _tokenId);
        tokenIdToClaimer[_tokenId].claimerAddress = msg.sender;
        tokenIdToClaimer[_tokenId].claimStatus = true;
        tokenIdToClaimer[_tokenId].email = _email;
        return tokenIdToClaimer[_tokenId].claimStatus;
    }

    function checkAuthenticity(uint256 _tokenId,string memory _secretPin) public view returns (string memory result) {
        require(_exists(_tokenId), 'This Tokenid not exists.');
        require(keccak256(abi.encodePacked(tokenIdToClaimer[_tokenId].secretPin)) == keccak256(abi.encodePacked(_secretPin)), 'Entered pin is not valid.');
        return _tokenURIs[_tokenId];
    }

    function getClaimStatus(uint256 _tokenId) public view returns (bool result){
        require(_exists(_tokenId), 'This Tokenid not exists.');
        return (tokenIdToClaimer[_tokenId].claimStatus);
    }
    

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

}