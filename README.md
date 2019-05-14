# ethereum-dapps-final-project
A Dapp project proposed in NTU DApp development course

----
# Voting system
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

Frontend
--------------------
#### Pre-configuration options
To run the fronend, please specify all required values.
Fill in all values in file ```.env``` as referenced file ```.env.template``` or set all of the following as environment variables

* ```REACT_APP_VOTING_CORE_ADDRESS``` - Voting Core contract address

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
