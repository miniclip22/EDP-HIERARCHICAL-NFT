// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "./interfaces/IERC6150.sol";

contract MyNFTContract is IERC6150 {
    struct NFT {
        string name;
        string description;
        string image;
        uint256 value;
        uint256 parentId;
        uint256[] childrenIds;
    }

    mapping(uint256 => NFT) private nfts;
    mapping(uint256 => address) private tokenOwners;
    mapping(uint256 => address) private tokenApprovals;
    mapping(address => uint256[]) private ownedTokens;
    mapping(address => mapping(address => bool)) private operatorApprovals;

    uint256 private nextTokenId;

    constructor() {
        nextTokenId = 1;
    }

    function mint(
        address to,
        uint256 parentId,
        string memory name,
        string memory description,
        string memory image,
        uint256 value
    ) external returns (uint256) {
        uint256 tokenId = nextTokenId;
        nextTokenId++;

        nfts[tokenId] = NFT({
            name: name,
            description: description,
            image: image,
            value: value,
            parentId: parentId,
            childrenIds: new uint256[](0)
        });

        tokenOwners[tokenId] = to;
        ownedTokens[to].push(tokenId);

        if (parentId > 0) {
            nfts[parentId].childrenIds.push(tokenId);
        }

        emit Minted(msg.sender, to, parentId, tokenId);

        return tokenId;
    }

    function parentOf(uint256 tokenId) external view override returns (uint256) {
        return nfts[tokenId].parentId;
    }

    function childrenOf(uint256 tokenId) external view override returns (uint256[] memory) {
        return nfts[tokenId].childrenIds;
    }

    function isRoot(uint256 tokenId) external view override returns (bool) {
        return nfts[tokenId].parentId == 0;
    }

    function isLeaf(uint256 tokenId) external view override returns (bool) {
        return nfts[tokenId].childrenIds.length == 0;
    }

    function approve(address to, uint256 tokenId) external override {
        require(to != address(0), "Approve to zero address");
        require(msg.sender == tokenOwners[tokenId] || _isApprovedForAll(tokenOwners[tokenId], msg.sender), "Not authorized");

        tokenApprovals[tokenId] = to;
    }

    function balanceOf(address owner) external view override returns (uint256 balance) {
        return ownedTokens[owner].length;
    }

    function getApproved(uint256 tokenId) external view override returns (address operator) {
        require(_exists(tokenId), "Token does not exist");
        return tokenApprovals[tokenId];
    }

    function isApprovedForAll(address owner, address operator) external view override returns (bool) {
        return operatorApprovals[owner][operator];
    }

    function ownerOf(uint256 tokenId) external view override returns (address owner) {
        require(_exists(tokenId), "Token does not exist");
        return tokenOwners[tokenId];
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external override {
        _transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external override {
        _transferFrom(from, to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external override {
        operatorApprovals[msg.sender][operator] = approved;
    }

    function supportsInterface(bytes4 interfaceId) external view override returns (bool) {
        return interfaceId == type(IERC6150).interfaceId;
    }

    function transferFrom(address from, address to, uint256 tokenId) external override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        _transferFrom(from, to, tokenId);
    }

    function _transferFrom(address from, address to, uint256 tokenId) internal {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        require(from == _ownerOf(tokenId), "Not owner");
        require(to != address(0), "Transfer to zero address");

        // Transfer ownership and update balances
        tokenOwners[tokenId] = to;
        ownedTokens[to].push(tokenId);
        ownedTokens[from] = _removeTokenFromOwner(from, tokenId);

        // Reset approval
        if (tokenApprovals[tokenId] != address(0)) {
            tokenApprovals[tokenId] = address(0);
        }
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenOwners[tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return (spender == tokenOwners[tokenId] || _getApproved(tokenId) == spender || _isApprovedForAll(_ownerOf(tokenId), spender));
    }

    function _getApproved(uint256 tokenId) internal view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return tokenApprovals[tokenId];
    }

    function _ownerOf(uint256 tokenId) internal view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return tokenOwners[tokenId];
    }

    function _isApprovedForAll(address owner, address operator) internal view returns (bool) {
        return operatorApprovals[owner][operator];
    }

    function _removeTokenFromOwner(address owner, uint256 tokenId) internal view returns (uint256[] memory) {
        uint256[] memory tokens = ownedTokens[owner];
        uint256[] memory newTokens = new uint256[](tokens.length - 1);

        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                // If the token is found, skip it
                continue;
            }

            newTokens[i] = tokens[i];
        }

        return newTokens;
    }
}
