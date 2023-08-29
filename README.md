# EDP-HIERARCHICAL-NFT

This project is a Truffle project that implements a smart contract for managing Hierarchical Non-Fungible Tokens (NFTs) using the ERC6150 standard. The contract includes a structure for NFTs and several mapping structures to handle ownership, approvals, and owned tokens.

This project is based on the documentation provided at [EIP-6150](https://eips.ethereum.org/EIPS/eip-6150), and adapts their smart contracts located [here](https://github.com/ethereum/EIPs/tree/master/assets/eip-6150/contracts). It's important to note that this project is currently under development, and many functions are not yet fully implemented.

## Pre-requisites

Before beginning, the following requirements should be met:

* The latest LTS version of [Node.js](https://nodejs.org/en/) should be installed
* A Windows/Linux/Mac machine is required
* [Truffle](https://trufflesuite.com/docs/truffle/how-to/install/) should be installed following the instructions provided in the link
* [Ganache](https://www.trufflesuite.com/ganache) should be installed for local development and configured on port 7545 and network ID 1337

## Installing EDP-HIERARCHICAL-NFT

To install EDP-HIERARCHICAL-NFT, the following steps should be followed:

1. Clone this repository to a local machine
2. Navigate to the project directory
3. Run `npm install` to install the required dependencies

## Using EDP-HIERARCHICAL-NFT

To use EDP-HIERARCHICAL-NFT, these steps should be followed:

1. Compile the smart contracts: Run `truffle compile` in the project directory
2. Deploy the smart contracts to the Ganache network: Run `truffle migrate --network ganache`
3. To run tests, navigate to the `test` directory and run `truffle test --network ganache`

## Project Structure

The project follows a typical Truffle project structure:

- `contracts/`: This directory contains the Solidity smart contracts. It includes the main contract `MyNFTContract.sol` and the ERC6150 interface
- `migrations/`: This directory contains scripts for deploying contracts to the blockchain
- `test/`: This directory contains JavaScript files for testing the smart contracts
- `package.json`: This file lists the npm dependencies of the project
- `truffle-config.js`: This file is used to configure the Truffle project
