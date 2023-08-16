const MyNFTContract = artifacts.require("MyNFTContract");
const { expect } = require("chai");
const BN = web3.utils.BN;

contract("MyNFTContract", (accounts) => {
    let myNFTInstance;
    let parentTokenId;
    let childTokenId;

    before(async () => {
        myNFTInstance = await MyNFTContract.deployed();
    });

    it("should mint a new parent token", async () => {
        // Set the required parameters for minting a token
        const minter = accounts[0];
        const to = accounts[1];
        const parentId = new BN(0); // Use BN for big numbers
        const name = "Parent NFT";
        const description = "This is the parent NFT";
        const image = "ipfs://QmXaKGm3qWLf3yPUDX4thYh9N2DpbVzE1RV6";
        const value = new BN(100); // Use BN for big numbers

        // Call the mint function
        const mintedToken = await myNFTInstance.mint(to, parentId, name, description, image, value);
        parentTokenId = mintedToken.logs[0].args.tokenId; // Access the tokenId from the event logs

        // Assert the event emitted
        expect(parentTokenId.toNumber()).to.be.above(0);
    });

    it("should mint a new child token", async () => {
        // Set the required parameters for minting a token
        const minter = accounts[0];
        const to = accounts[2]; // Set a different account as the recipient of the child token
        const parentId = parentTokenId.toNumber(); // Set the parent ID to the parent token ID
        const name = "Child NFT";
        const description = "This is the child NFT";
        const image = "ipfs://QmXaKGm3qWLf3yPUDX4thYh9N2DpbVzE1RV6";
        const value = new BN(50); // Use BN for big numbers

        // Call the mint function
        const mintedToken = await myNFTInstance.mint(to, parentId, name, description, image, value);
        childTokenId = mintedToken.logs[0].args.tokenId; // Access the tokenId from the event logs

        // Assert the event emitted
        expect(childTokenId.toNumber()).to.be.above(0);
    });

    it("should have the parent as the actual parent of the child token", async () => {
        // Call the parentOf function on the child token
        const actualParentId = await myNFTInstance.parentOf(childTokenId);

        // Assert the actual parent ID matches the expected parent ID
        expect(actualParentId.toNumber()).to.equal(parentTokenId.toNumber());
    });

    it("should have the child in the children list of the parent token", async () => {
        // Call the childrenOf function on the parent token
        const childrenIds = await myNFTInstance.childrenOf(parentTokenId);

        // Assert that the children list contains the child token ID
        expect(childrenIds).to.deep.include(new BN(childTokenId));
    });
});
