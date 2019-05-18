# Voting system
[![Netlify Status](https://api.netlify.com/api/v1/badges/34104410-f4a4-48a3-8603-876aeef24cbf/deploy-status)](https://app.netlify.com/sites/dpolls/deploys)

A decentralized voting system proposed in NTU DApp course - [https://dpolls.netlify.com](https://dpolls.netlify.com)

### Feature
* Decentralized voting system on top of Ethereum
  * Anyone can host their own polls
  * Anyone can vote for polls
  * Adding up to 256 options for a poll
  * Poll closed on a specific block number
  * Anyone can view results anytime
* Be a host by applying for a membership
* Membership Plan
  * 1 ETH for CITIZEN
    * A max number of 10 times creating a poll
  * 10 ETH for DIAMOND
    * **Unlimited**
* Contract administration *(smart contract only)*
  * Set admin
  * Withdraw funds from smart contract
  * Reclaim ownership of registries in case of new core contract replacement

### Table of Contents
* [smart-contract](#smart-contracts)
  * Smart contracts on Ethereum blockchain
* [frontend](#frontend)
  * User interface


Smart Contracts
--------------------
#### Prerequisites
* Truffle - blockchain development framework
* Ganache - private blockchain network

#### Components
* VotingCore - Core functionality
* VotingHostRegistry - Maintain a list of registered hosts and memberships
* VotingRegistry - Maintain a list of active/inactive polls
* Voting - A poll entity

#### Run testing units
```shell
$ truffle test
```

#### Deployment
Set all parameters in file ```.env``` (referenced from ```.env.template```) or as environment variables
* ```MNEMONIC``` - Mnemonic seed for use of contract deployment
* ```INFURA_KEY``` - Infura Secret Token to get access to network
* ```DEPOSIT_ACCOUNT``` - Deposit account for ethers withdrawals from core contract

```shell
$ npm install
$ # All required environment parameters in file .env are ready at this point.
$ truffle deploy --network <NETWORK>
```

Frontend
--------------------
#### Pre-configuration options
To run the frontend, please specify all required values.
Set all parameters in file ```.env``` (referenced from ```.env.template```) or as environment variables

* ```REACT_APP_VOTING_CORE_ADDRESS``` - Voting Core contract address
* ```REACT_APP_NETWORK_ID``` - Restrict access to a specific Network ID (1: Mainnet, 3: Ropsten..., etc) where the Voting Core deployed *(optional - defaults to all network)*
* ```REACT_APP_GOOGLE_ANALYTICS_TRACKING_CODE``` - Set tracking code for page views *(optional - disabled by default)*

#### Run dev server
```shell
$ npm start
```

#### Build for production environment
```shell
$ npm build
$ ## dist folder: ./build
$ cd build
```

Place files in folder ```build``` in static web server (e.g. **Nginx**)
