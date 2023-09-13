pragma solidity ^0.8.0;

import "./MyNFTContract.sol";

contract TestMyNFTContract is MyNFTContract {
    uint256 private constant MAX_PARENT_TOKENS_FOR_TEST = 10;

    function getMaxParentTokens() public pure override returns (uint256) {
        return MAX_PARENT_TOKENS_FOR_TEST;
    }
}
