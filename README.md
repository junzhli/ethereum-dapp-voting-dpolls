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
  * As a CITIZEN paying for 1 ETH
    * A max number of 10 times creating a poll
  * As a DIAMOND paying for 10 ETH
    * **Unlimited**

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