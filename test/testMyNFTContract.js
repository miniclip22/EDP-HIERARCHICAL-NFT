const TestMyNFTContract = artifacts.require("TestMyNFTContract");
const { BigNumber } = require("bignumber.js");

contract("TestMyNFTContract", (accounts) => {
    let myNFTInstance;

    beforeEach(async () => {
        myNFTInstance = await TestMyNFTContract.new();
    });


    it("should respect parent token minting limit", async () => {
        const maxParentTokens = await myNFTInstance.getMaxParentTokens();

        const parentName = "Parent Token";
        const parentDescription = "This is a parent token";
        const parentImage = "parent_image.jpg";
        const parentValue = 100;

        // Mint tokens up to the maximum limit minus 1
        for (let i = 0; i < maxParentTokens.toNumber() - 1; i++) {
            await myNFTInstance.mintParentToken(parentName + i, parentDescription + i, parentImage, parentValue);
        }

// Verify that the contract allows minting one more token
        let receipt = await myNFTInstance.mintParentToken(parentName + maxParentTokens.toNumber(), parentDescription + maxParentTokens.toNumber(), parentImage, parentValue);
        const lastParentTokenMintedEvent = receipt.logs.find(log => log.event === "ParentTokenMinted");
        assert.isTrue(new BigNumber(lastParentTokenMintedEvent.args.tokenId).isGreaterThan(0), "The last parent token should have a valid ID");

// Try to mint one more token, which should fail
        try {
            await myNFTInstance.mintParentToken(parentName + maxParentTokens.toNumber() + 1, parentDescription + maxParentTokens.toNumber() + 1, parentImage, parentValue);
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`);
        }

    });


});
