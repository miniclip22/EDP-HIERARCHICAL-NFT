pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract MyNFTContract is ERC721Enumerable, Ownable {
    uint256 private constant MAX_PARENT_TOKENS = 2 ** 128;

    event ChildTokenMinted(uint256 indexed tokenId, uint256 indexed parentId, string name, string description, string image, uint256 value, string location);

    struct ParentToken {
        string name;
        string description;
        string image;
        uint256 value;
        uint256[] childTokenIds;
    }

    struct ChildToken {
        uint256 parentId;
        string name;
        string description;
        string image;
        uint256 value;
        string location;
    }

    mapping (uint256 => bool) private _parentTokenExists;
    mapping (uint256 => mapping(uint256 => bool)) private _childTokenExists;

    mapping(bytes32 => bool) private _parentTokenPropertiesExist;
    mapping(bytes32 => bool) private _childTokenPropertiesExist;



    ParentToken[] private parentTokens;
    ChildToken[] private childTokens;

    constructor() ERC721("MyNFTContract", "NFTC") {}

    event ParentTokenMinted(uint256 indexed tokenId);

    function mintParentToken(
        string memory name,
        string memory description,
        string memory image,
        uint256 value
    ) public onlyOwner returns (uint256) {
        require(parentTokens.length < MAX_PARENT_TOKENS, "Max number of parent tokens reached");

        bytes32 propertiesHash = keccak256(abi.encodePacked(name, description, image, value));
        require(!_parentTokenPropertiesExist[propertiesHash], "Parent token with these properties already minted");
        _parentTokenPropertiesExist[propertiesHash] = true;

        uint256 tokenId = parentTokens.length + 1;
        _mint(msg.sender, tokenId << 128);
        emit ParentTokenMinted(tokenId << 128);

        parentTokens.push(
            ParentToken({
                name: name,
                description: description,
                image: image,
                value: value,
                childTokenIds: new uint256[](0)
            })
        );

        return tokenId;
    }

    function mintChildToken(
        uint256 parentId,
        string memory name,
        string memory description,
        string memory image,
        uint256 value,
        string memory location
    ) public onlyOwner returns (uint256) {
        require(parentId > 0 && parentId <= parentTokens.length, "Invalid parent token ID");

        bytes32 propertiesHash = keccak256(abi.encodePacked(parentId, name, description, image, value, location));
        require(!_childTokenPropertiesExist[propertiesHash], "Child token with these properties already minted under this parent");
        _childTokenPropertiesExist[propertiesHash] = true;

        ParentToken storage parent = parentTokens[parentId - 1];
        uint256 childTokenId = parent.childTokenIds.length + 1;
        uint256 tokenId = (parentId << 128) + childTokenId;

        _mint(msg.sender, tokenId);
        parent.childTokenIds.push(childTokenId);
        childTokens.push(
            ChildToken({
                parentId: parentId,
                name: name,
                description: description,
                image: image,
                value: value,
                location: location
            })
        );

        emit ChildTokenMinted(childTokenId, parentId, name, description, image, value, location);
        return childTokenId;
    }

    function getChildTokenId(uint256 parentId, uint256 index) public view returns (uint256) {
        require(parentId > 0 && parentId <= parentTokens.length, "Invalid parent token ID");
        ParentToken storage parent = parentTokens[parentId - 1];
        require(index < parent.childTokenIds.length, "Invalid child token index");
        return parent.childTokenIds[index];
    }

    function getChildTokenData(uint256 _childTokenId) public view returns (ChildToken memory) {
        require(_childTokenId > 0 && _childTokenId <= childTokens.length, "Invalid child token ID");
        return childTokens[_childTokenId - 1];
    }

    function childrenOf(uint256 _parentId) public view returns (uint256[] memory) {
        require(_parentId > 0 && _parentId <= parentTokens.length, "Invalid parent token ID");
        return parentTokens[_parentId - 1].childTokenIds;
    }

    function updateChildTokenProperties(
        uint256 _childTokenId,
        string memory _name,
        string memory _description,
        string memory _image,
        uint256 _value,
        string memory _location
    ) public {
        require(_childTokenId > 0 && _childTokenId <= childTokens.length, "Invalid child token ID");
        ChildToken storage child = childTokens[_childTokenId - 1];
        child.name = _name;
        child.description = _description;
        child.image = _image;
        child.value = _value;
        child.location = _location;
    }

    function getParentTokenProperties(uint256 parentId)
    public
    view
    returns (
        string memory name,
        string memory description,
        string memory image,
        uint256 value,
        uint256[] memory childTokenIds
    )
    {
        require(parentId > 0 && parentId <= parentTokens.length, "Invalid parent token ID");

        ParentToken storage parent = parentTokens[parentId - 1];
        return (
            parent.name,
            parent.description,
            parent.image,
            parent.value,
            parent.childTokenIds
        );
    }

    function getMaxParentTokens() public pure virtual returns (uint256) {
        return MAX_PARENT_TOKENS;
    }

    function mintParentToken(address to, uint256 tokenId) public {
        require(!_parentTokenExists[tokenId], "ERC721: token already minted");
        _parentTokenExists[tokenId] = true;
        _mint(to, tokenId);
    }

    function mintChildToken(address to, uint256 parentId, uint256 childId) public {
        require(!_childTokenExists[parentId][childId], "Child token ID already exists for this parent");
        _childTokenExists[parentId][childId] = true;
        uint256 tokenId = parentId << 128 | childId;
        _mint(to, tokenId);
    }














}
