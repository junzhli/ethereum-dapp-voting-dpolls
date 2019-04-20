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
* Be a host by applying for a membership
* Membership Plan
  * 1 ETH for CITIZEN
    * A max number of 10 times creating a poll
  * 10 ETH for DIAMOND
    * **Unlimited**
* Contract administration
  * setAdmin
  * withdraw funds from smart contract

### Table of Contents
* [smart-contract](#smart-contracts)
  * Smart contracts on Ethereum blockchain
* web3
  * test stuffs
  * be removed in future version


Smart Contracts
--------------------
#### Prerequisites
* Truffle - blockchain development framework
* Ganache - private blockchain network

#### Components
* VotingCore - Core functionality
* VotingHostsRegistry - Maintain a list of registered hosts and memberships
* VotingRegistry - Maintain a list of active/inactive polls
* Voting - A poll entity

#### Run testing units
```shell
$ truffle test
```
