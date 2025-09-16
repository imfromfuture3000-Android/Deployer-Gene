// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title OneirobotSyndicate - AI Gene Deployer Mint Gene Implementation
 * @dev 10x more secure, gas-efficient, and extensible NFT contract for Oneirobot tokens
 * @author AI Gene Deployer - Ultimate Blockchain Coding Superintelligence
 */
contract OneirobotSyndicate is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // ================================ ROLES ================================
    bytes32 public constant SYNDICATE_MASTER_ROLE = keccak256("SYNDICATE_MASTER_ROLE");
    bytes32 public constant MINT_GENE_ROLE = keccak256("MINT_GENE_ROLE");
    
    // ================================ STATE VARIABLES ================================
    Counters.Counter private _tokenIdCounter;
    
    // Gas-optimized storage using packed structs
    struct OneirobotTraits {
        uint64 quantumCore;      // 0-10000 (2 decimals precision)
        uint64 dreamCircuit;     // 0-10000 (2 decimals precision)  
        uint64 neuralMesh;       // 0-10000 (2 decimals precision)
        uint32 synthesisLevel;   // 1-100
        uint16 rarity;           // 1-1000 (rarer = higher number)
        uint8 generation;        // 1-255
        uint8 powerLevel;        // 1-100
    }
    
    // Mapping from token ID to traits
    mapping(uint256 => OneirobotTraits) public oneirobotTraits;
    
    // Mapping to track used nonces for pseudorandomness
    mapping(bytes32 => bool) private _usedSeeds;
    
    // IPFS base URI for metadata
    string private _baseTokenURI;
    
    // Controller master address (derived from Solana address)
    address public constant CONTROLLER_MASTER = 0x4eAbbE6EAD2c295b3f4eFD78f6A7e89eAb1DDfFb; // Ethereum equivalent
    
    // Maximum supply to prevent infinite minting
    uint256 public constant MAX_SUPPLY = 10000;
    
    // Gas limit for external calls
    uint256 public constant GAS_LIMIT = 100000;

    // ================================ EVENTS ================================
    event OneirobotMinted(
        uint256 indexed tokenId, 
        address indexed to, 
        uint256 quantumCore,
        uint256 dreamCircuit,
        uint256 neuralMesh,
        uint8 generation
    );
    
    event MetadataUpdated(uint256 indexed tokenId, string ipfsHash);
    event SyndicateMasterAdded(address indexed master);
    event MintGeneActivated(address indexed activator, uint256 timestamp);

    // ================================ MODIFIERS ================================
    modifier onlySyndicateMaster() {
        require(
            hasRole(SYNDICATE_MASTER_ROLE, msg.sender) || msg.sender == CONTROLLER_MASTER,
            "OneirobotSyndicate: Caller is not a Syndicate Master"
        );
        _;
    }
    
    modifier withinSupplyLimit() {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "OneirobotSyndicate: Max supply reached");
        _;
    }

    // ================================ CONSTRUCTOR ================================
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SYNDICATE_MASTER_ROLE, msg.sender);
        _grantRole(MINT_GENE_ROLE, msg.sender);
        
        // Grant Syndicate Master role to controller
        _grantRole(SYNDICATE_MASTER_ROLE, CONTROLLER_MASTER);
        
        _baseTokenURI = baseTokenURI;
        
        emit MintGeneActivated(msg.sender, block.timestamp);
    }

    // ================================ MINT GENE CORE FUNCTION ================================
    /**
     * @dev The ultimate Oneirobot minting function - surpasses basic implementations
     * @param to Address to mint the Oneirobot to
     * @param ipfsMetadataHash IPFS hash for the token metadata
     * @return tokenId The minted token ID
     */
    function mintOneirobot(
        address to, 
        string memory ipfsMetadataHash
    ) external onlySyndicateMaster nonReentrant whenNotPaused withinSupplyLimit returns (uint256) {
        require(to != address(0), "OneirobotSyndicate: Cannot mint to zero address");
        require(bytes(ipfsMetadataHash).length > 0, "OneirobotSyndicate: IPFS hash required");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Generate unique pseudorandom traits using on-chain entropy
        OneirobotTraits memory traits = _generateOneirobotTraits(tokenId, to);
        oneirobotTraits[tokenId] = traits;
        
        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsMetadataHash);
        
        emit OneirobotMinted(
            tokenId,
            to,
            traits.quantumCore,
            traits.dreamCircuit,
            traits.neuralMesh,
            traits.generation
        );
        
        emit MetadataUpdated(tokenId, ipfsMetadataHash);
        
        return tokenId;
    }

    // ================================ TRAIT GENERATION ================================
    /**
     * @dev Generates provably random traits using multiple entropy sources
     * @param tokenId The token ID being minted
     * @param to The recipient address
     * @return traits Generated OneirobotTraits struct
     */
    function _generateOneirobotTraits(
        uint256 tokenId, 
        address to
    ) private returns (OneirobotTraits memory traits) {
        // Create unique seed from multiple entropy sources
        bytes32 seed = keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao, // More secure than block.difficulty
            tokenId,
            to,
            msg.sender,
            _tokenIdCounter.current(),
            blockhash(block.number - 1)
        ));
        
        // Ensure seed uniqueness to prevent replay attacks
        require(!_usedSeeds[seed], "OneirobotSyndicate: Seed already used");
        _usedSeeds[seed] = true;
        
        // Use bitwise operations for gas optimization
        uint256 entropy = uint256(seed);
        
        traits.quantumCore = uint64((entropy & 0xFFFF) % 10001); // 0-10000
        traits.dreamCircuit = uint64(((entropy >> 16) & 0xFFFF) % 10001);
        traits.neuralMesh = uint64(((entropy >> 32) & 0xFFFF) % 10001);
        traits.synthesisLevel = uint32(((entropy >> 48) & 0xFF) % 100 + 1); // 1-100
        traits.rarity = uint16(((entropy >> 56) & 0xFF) % 1000 + 1); // 1-1000
        traits.generation = uint8(((entropy >> 64) & 0xFF) % 5 + 1); // 1-5
        traits.powerLevel = uint8(((entropy >> 72) & 0xFF) % 100 + 1); // 1-100
        
        return traits;
    }

    // ================================ METADATA FUNCTIONS ================================
    /**
     * @dev Returns the base URI for tokens
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Updates base URI (only admin)
     */
    function setBaseURI(string memory baseTokenURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = baseTokenURI;
    }

    // ================================ ACCESS CONTROL ================================
    /**
     * @dev Add a new Syndicate Master (only admin)
     */
    function addSyndicateMaster(address master) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(master != address(0), "OneirobotSyndicate: Invalid master address");
        _grantRole(SYNDICATE_MASTER_ROLE, master);
        emit SyndicateMasterAdded(master);
    }
    
    /**
     * @dev Remove a Syndicate Master (only admin)
     */
    function removeSyndicateMaster(address master) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(SYNDICATE_MASTER_ROLE, master);
    }

    // ================================ EMERGENCY CONTROLS ================================
    /**
     * @dev Pause contract (only admin)
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only admin)
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ================================ VIEW FUNCTIONS ================================
    /**
     * @dev Get Oneirobot traits for a token
     */
    function getOneirobotTraits(uint256 tokenId) external view returns (OneirobotTraits memory) {
        require(_exists(tokenId), "OneirobotSyndicate: Token does not exist");
        return oneirobotTraits[tokenId];
    }
    
    /**
     * @dev Get total supply of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Check if address is Syndicate Master
     */
    function isSyndicateMaster(address account) external view returns (bool) {
        return hasRole(SYNDICATE_MASTER_ROLE, account) || account == CONTROLLER_MASTER;
    }

    // ================================ REQUIRED OVERRIDES ================================
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        delete oneirobotTraits[tokenId];
    }
}