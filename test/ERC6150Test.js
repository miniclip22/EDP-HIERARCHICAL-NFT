const MyNFTContract = artifacts.require("MyNFTContract");
const chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN); // Include the Chai Big Number plugin
chai.use(chaiBN);

const { expect } = chai;


contract("MyNFTContract", (accounts) => {
    let myNFTInstance;
    let parentTokenId;
    let childTokenId;

    before(async () => {
        myNFTInstance = await MyNFTContract.deployed();

        // Mint a new parent token
        const minter = accounts[0];
        const to = accounts[1];
        const parentId = new BN(0);
        const name = "Parent NFT";
        const description = "This is the parent NFT";
        const image = "ipfs://QmXaKGm3qWLf3yPUDX4thYh9N2DpbVzE1RV6";
        const value = new BN(100);

        const mintedParent = await myNFTInstance.mint(to, parentId, name, description, image, value);
        parentTokenId = mintedParent.logs[0].args.tokenId;

        // Mint a new child token
        const toChild = accounts[2];
        const nameChild = "Child NFT";
        const descriptionChild = "This is the child NFT";
        const imageChild = "ipfs://QmXaKGm3qWLf3yPUDX4thYh9N2DpbVzE1RV6";
        const valueChild = new BN(50);

        const mintedChild = await myNFTInstance.mint(toChild, parentTokenId, nameChild, descriptionChild, imageChild, valueChild);
        childTokenId = mintedChild.logs[0].args.tokenId;
    });

    it("should have the parent as the actual parent of the child token", async () => {
        const actualParentId = await myNFTInstance.parentOf(childTokenId);
        expect(actualParentId).to.be.bignumber.equal(parentTokenId);
    });

    it("should have the child in the children list of the parent token", async () => {
        const childrenIds = await myNFTInstance.childrenOf(parentTokenId);
        expect(childrenIds).to.deep.include(new BN(childTokenId));
    });
});
