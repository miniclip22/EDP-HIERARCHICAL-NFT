const MyNFTContract = artifacts.require("MyNFTContract");
const BN = web3.utils.BN;
const { expectRevert } = require('@openzeppelin/test-helpers');
const truffleAssert = require('truffle-assertions');

contract("MyNFTContract", (accounts) => {

    const tokenURI = "https://token.com";
    const creatorAddress = accounts[0]; // Adjust this as necessary

    const [owner, unauthorizedAccount] = accounts;

    let myNFTInstance;
    let parentTokenId;
    let childTokenIds;

    beforeEach(async () => {
        myNFTInstance = await MyNFTContract.new({from: owner});
        childTokenIds = [];

        // Mint a new parent token before each test
        const parentName = "Parent Token";
        const parentDescription = "This is a parent token";
        const parentImage = "parent_image.jpg";
        const parentValue = 100;

        const parentReceipt = await myNFTInstance.mintParentToken(parentName, parentDescription, parentImage, parentValue);
        const parentTokenMintedEvent = parentReceipt.logs.find(log => log.event === "ParentTokenMinted");
        parentTokenId = parentTokenMintedEvent.args.tokenId;

        assert.isTrue(new BN(parentTokenId).gt(new BN(0)), "Parent token should have a valid ID");

        // Shift back the parent token ID
        parentTokenId = new BN(parentTokenId).shrn(128).toString();

        // Mint a new child token for the new parent token
        const childName = "Child Token";
        const childDescription = "This is a child token";
        const childImage = "child_image.jpg";
        const childValue = 50;
        const childLocation = "Location A";

        const childReceipt = await myNFTInstance.mintChildToken(parentTokenId, childName, childDescription, childImage, childValue, childLocation);
        const childTokenMintedEvent = childReceipt.logs.find(log => log.event === "ChildTokenMinted");
        const childTokenId = childTokenMintedEvent.args.tokenId;

        assert.isTrue(new BN(childTokenId).gt(new BN(0)), "Child token should have a valid ID");
        childTokenIds.push(childTokenId);
    });

    it("should mint a new child token", async () => {
        const parentId = parentTokenId;
        const name = "Child Token 2";
        const description = "This is another child token";
        const image = "child_image2.jpg";
        const value = 75;
        const location = "Location B";

        const result = await myNFTInstance.mintChildToken(parentId, name, description, image, value, location);
        const childTokenId = await myNFTInstance.getChildTokenId(parentId, 1);
        assert.isFalse(childTokenIds.includes(childTokenId), "Child token should not be minted before");
        childTokenIds.push(childTokenId);
    });

    it("should get child token data", async () => {
        const childTokenData = await myNFTInstance.getChildTokenData(childTokenIds[0]);
        assert.equal(childTokenData.parentId, parentTokenId, "Parent ID should be correct");
        assert.equal(childTokenData.name, "Child Token", "Name should be correct");
        assert.equal(childTokenData.description, "This is a child token", "Description should be correct");
        assert.equal(childTokenData.image, "child_image.jpg", "Image should be correct");
        assert.equal(childTokenData.value, 50, "Value should be correct");
        assert.equal(childTokenData.location, "Location A", "Location should be correct");
    });

    it("should get the children of a parent token", async () => {
        const children = await myNFTInstance.childrenOf(parentTokenId);
        assert.equal(children.length, childTokenIds.length, "The number of children should be correct");
        children.forEach((childId, i) => {
            assert.equal(childId.toString(), childTokenIds[i].toString(), "Child token ID should be correct");
        });
    });



    it("should fail to mint a new child token from an unauthorized account", async () => {
        const parentId = parentTokenId;
        const name = "Child Token 2";
        const description = "This is another child token";
        const image = "child_image2.jpg";
        const value = 75;
        const location = "Location B";

        try {
            const result = await myNFTInstance.mintChildToken(parentId, name, description, image, value, location, {from: unauthorizedAccount});
            assert.fail("The transaction should have thrown an error");
        }
        catch (err) {
            assert.include(err.message, "revert", "The error message should contain 'revert'");
        }
    });

    it("should verify child token ownership", async () => {
        const parentId = new BN(parentTokenId);
        const relativeChildTokenId = new BN(childTokenIds[0]);

        // Encode the token ID in the same way the mintChildToken function does.
        const encodedChildTokenId = parentId.shln(128).add(relativeChildTokenId);

        // Obtain the owner of the child token using the ERC721 ownerOf function
        const childTokenOwner = await myNFTInstance.ownerOf(encodedChildTokenId.toString());

        // Check if the owner of the child token is the same as the owner of the contract
        assert.equal(childTokenOwner, owner, "Owner of the child token should be the owner of the contract");
    });


    it("should maintain child token list consistency", async () => {
        // Mint another child token
        const name = "Child Token 3";
        const description = "This is yet another child token";
        const image = "child_image3.jpg";
        const value = 25;
        const location = "Location C";

        const result = await myNFTInstance.mintChildToken(parentTokenId, name, description, image, value, location);
        const childTokenMintedEvent = result.logs.find(log => log.event === "ChildTokenMinted");
        const relativeChildTokenId = childTokenMintedEvent.args.tokenId; // Get the relative child token ID

        const children = await myNFTInstance.childrenOf(parentTokenId); // Get the list of child tokens

        // The child token we just minted should be in the list
        assert.include(children.map(id => id.toString()), relativeChildTokenId.toString(), "The newly minted child token should appear in the list of children for its parent");

        // Also, update the list of child token ids for future tests
        childTokenIds.push(relativeChildTokenId);
    });


    it("should only allow minting unique tokens", async () => {
        const parentName = "Parent Token";
        const parentDescription = "This is a parent token";
        const parentImage = "parent_image.jpg";
        const parentValue = 100;

        const childName = "Child Token";
        const childDescription = "This is a child token";
        const childImage = "child_image.jpg";
        const childValue = 50;
        const childLocation = "Location A";

        // Try to mint a new parent token with the same properties as an existing parent token
        try {
            await myNFTInstance.mintParentToken(parentName, parentDescription, parentImage, parentValue);
            assert.fail("Expected the contract to revert when trying to mint a parent token with the same properties as an existing parent token");
        } catch (error) {
            assert.include(error.message, "revert Parent token with these properties already minted", "Expected a different error message when trying to mint a parent token with the same properties as an existing parent token");
        }

        // Try to mint a new child token with the same properties as an existing child token
        try {
            await myNFTInstance.mintChildToken(parentTokenId, childName, childDescription, childImage, childValue, childLocation, { from: owner });
            assert.fail("Expected the contract to revert when trying to mint a child token with the same properties as an existing child token");
        } catch (error) {
            assert.include(error.message, "revert Child token with these properties already minted", "Expected a different error message when trying to mint a child token with the same properties as an existing child token");
        }
    });




});
