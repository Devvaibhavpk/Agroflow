// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgroflowNFT
 * @dev ERC-721 NFT contract for Agroflow harvest batch traceability
 * Each NFT represents a verified harvest batch with immutable provenance data
 */
contract AgroflowNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from QR code ID to token ID
    mapping(string => uint256) public qrCodeToTokenId;
    
    // Mapping from token ID to QR code ID
    mapping(uint256 => string) public tokenIdToQrCode;
    
    // Mapping from token ID to data hash (for integrity verification)
    mapping(uint256 => bytes32) public tokenDataHash;
    
    // Events
    event BatchMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string qrCodeId,
        bytes32 dataHash,
        string tokenURI
    );
    
    event BatchTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string qrCodeId
    );

    constructor() ERC721("Agroflow Harvest NFT", "AGRO") Ownable(msg.sender) {}

    /**
     * @dev Mint a new harvest batch NFT
     * @param to The address that will own the NFT
     * @param qrCodeId The unique QR code identifier for the batch
     * @param dataHash SHA-256 hash of the batch data for integrity
     * @param uri The metadata URI (IPFS or API endpoint)
     */
    function mintBatch(
        address to,
        string memory qrCodeId,
        bytes32 dataHash,
        string memory uri
    ) public returns (uint256) {
        require(bytes(qrCodeId).length > 0, "QR code ID required");
        require(qrCodeToTokenId[qrCodeId] == 0, "QR code already minted");
        
        uint256 tokenId = ++_nextTokenId;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        qrCodeToTokenId[qrCodeId] = tokenId;
        tokenIdToQrCode[tokenId] = qrCodeId;
        tokenDataHash[tokenId] = dataHash;
        
        emit BatchMinted(tokenId, to, qrCodeId, dataHash, uri);
        
        return tokenId;
    }
    
    /**
     * @dev Get token ID by QR code
     * @param qrCodeId The QR code identifier
     */
    function getTokenByQrCode(string memory qrCodeId) public view returns (uint256) {
        return qrCodeToTokenId[qrCodeId];
    }
    
    /**
     * @dev Verify data integrity by comparing hashes
     * @param tokenId The token ID to verify
     * @param dataHash The hash to compare against
     */
    function verifyIntegrity(uint256 tokenId, bytes32 dataHash) public view returns (bool) {
        return tokenDataHash[tokenId] == dataHash;
    }
    
    /**
     * @dev Get batch info
     * @param tokenId The token ID
     */
    function getBatchInfo(uint256 tokenId) public view returns (
        address owner,
        string memory qrCodeId,
        bytes32 dataHash,
        string memory uri
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (
            ownerOf(tokenId),
            tokenIdToQrCode[tokenId],
            tokenDataHash[tokenId],
            tokenURI(tokenId)
        );
    }
    
    /**
     * @dev Total supply of minted NFTs
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Override transfer to emit custom event
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);
        
        if (from != address(0) && to != address(0)) {
            emit BatchTransferred(tokenId, from, to, tokenIdToQrCode[tokenId]);
        }
        
        return from;
    }
}
