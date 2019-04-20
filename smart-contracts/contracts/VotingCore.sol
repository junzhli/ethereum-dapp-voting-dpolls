pragma solidity ^0.5.0;
import './Voting.sol';
import './VotingRegistry.sol';
import './VotingHostsRegistry.sol';

contract VotingCore {
  address private admin;
  address private votingRegistry;
  address private votingHostsRegistry;
  address payable depositAccount;

  event newVoting(address _voting);

  uint constant ONE_ETHER = 1e18;
  uint constant TEN_ETHERS = 10 * 1e18;

  constructor(address _votingRegistry, address _votingHostsRegistry, address payable _depositAccount) public {
    admin = msg.sender;
    votingRegistry = _votingRegistry;
    votingHostsRegistry = _votingHostsRegistry;
    depositAccount = _depositAccount;
  }

  modifier hostOnly(address _address) {
    VotingHostsRegistry hostsRegistry = VotingHostsRegistry(votingHostsRegistry);
    require(hostsRegistry.isHost(_address));
    _;
  }

  modifier adminOnly() {
    require(msg.sender == admin);
    _;
  }

  /**
   * Getter and setters
   */

  function getAdmin() public view returns (address) {
    return admin;
  }

  function setAdmin(address _admin) adminOnly public {
    admin = _admin;
  }

  function getDepositAccount() public view returns (address) {
    return depositAccount;
  }

  function setDepositAccount(address payable _depositAccount) adminOnly public {
    depositAccount = _depositAccount;
  }

  function getVotingHostsRegistry() public view returns (address) {
    return votingHostsRegistry;
  }

  function setVotingHostsRegistry(address _votingHostsRegistry) adminOnly public {
    votingHostsRegistry = _votingHostsRegistry;
  }

  function getRegistry() public view returns (address) {
    return votingRegistry;
  }

  function setRegistry(address _votingRegistry) adminOnly public {
    votingRegistry = _votingRegistry;
  }

  /**
   * Proxied methods for VotingRegistry
   */

  function getAmountVotings() public view returns (uint) {
    VotingRegistry registry = VotingRegistry(votingRegistry);
    return registry.getAmountVotings();
  }

  function getVotingItemByIndex(uint _index) public view returns (address) {
    VotingRegistry registry = VotingRegistry(votingRegistry);
    return registry.getVotingItemByIndex(_index);
  }

  /**
   * Proxied methods for VotingHostsRegistry
   */

  function getMembership(address _address) public view returns (uint) {
    VotingHostsRegistry hostsRegistry = VotingHostsRegistry(votingHostsRegistry);
    return uint(hostsRegistry.getMembership(_address));
  }

  /**
   * Core functionality
   */

  function createVoting(bytes32 title, bytes32[] memory optionTitles, uint expiryBlockNumber) hostOnly(msg.sender) public {
    Voting voting = new Voting(title, optionTitles, expiryBlockNumber, msg.sender);
    VotingRegistry registry = VotingRegistry(votingRegistry);
    registry.depositVoting(voting);
    emit newVoting(address(voting));
  }

  function applyAsHost() public payable {
    VotingHostsRegistry hostsRegistry = VotingHostsRegistry(votingHostsRegistry);
    VotingHostsRegistry.Membership memberType = _checkMembership(msg.value);
    hostsRegistry.depositHost(msg.sender, memberType);
  }

  function _checkMembership(uint _value) internal pure returns (VotingHostsRegistry.Membership) {
    require(_value == ONE_ETHER || _value == TEN_ETHERS);
    if (_value == ONE_ETHER) {
      return VotingHostsRegistry.Membership.CITIZEN;
    } else if (_value == TEN_ETHERS) {
      return VotingHostsRegistry.Membership.DIAMOND;
    }
  }

  function withdrawEther() adminOnly public {
    depositAccount.transfer(address(this).balance);
  }
}
