const MyNFTContract = artifacts.require("MyNFTContract");

module.exports = function (deployer) {
    deployer.deploy(MyNFTContract);
};
