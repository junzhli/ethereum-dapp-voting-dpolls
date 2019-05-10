pragma solidity ^0.5.0;
import './baseContracts/Permissioned.sol';
import './Voting.sol';
import './VotingRegistry.sol';
import './VotingHostRegistry.sol';

contract VotingCore is Permissioned {
  address public votingRegistry;
  address public votingHostRegistry;
  address payable public depositAccount;

  event newVoting(address _voting);
  event ejectVotingRegistry(address _votingRegistry);
  event ejectVotingHostRegistry(address _votingHostRegistry);

  uint constant ONE_ETHER = 1e18;
  uint constant TEN_ETHERS = 10 * 1e18;

  constructor(address _votingRegistry, address _votingHostRegistry, address payable _depositAccount) public {
    votingRegistry = _votingRegistry;
    votingHostRegistry = _votingHostRegistry;
    depositAccount = _depositAccount;
  }

  modifier hostOnly(address _address) {
    VotingHostRegistry hostRegistry = VotingHostRegistry(votingHostRegistry);
    require(hostRegistry.isHost(_address));
    _;
  }

  function setDepositAccount(address payable _depositAccount) adminOnly public {
    depositAccount = _depositAccount;
  }

  function setVotingHostRegistry(address _votingHostRegistry) adminOnly public {
    votingHostRegistry = _votingHostRegistry;
  }

  function setVotingRegistry(address _votingRegistry) adminOnly public {
    votingRegistry = _votingRegistry;
  }

  function getAmountVotings() public view returns (uint) {
    VotingRegistry registry = VotingRegistry(votingRegistry);
    return registry.getAmountVotings();
  }

  function getVotingItemByIndex(uint _index) public view returns (address) {
    VotingRegistry registry = VotingRegistry(votingRegistry);
    return registry.getVotingItemByIndex(_index);
  }

  function getMembership(address _address) public view returns (uint) {
    VotingHostRegistry hostRegistry = VotingHostRegistry(votingHostRegistry);
    return uint(hostRegistry.getMembership(_address));
  }

  function getQuota(address _address) public view returns (uint) {
    VotingHostRegistry hostRegistry = VotingHostRegistry(votingHostRegistry);
    return hostRegistry.getQuota(_address);
  }

  function createVoting(bytes32 title, bytes32[] memory optionTitles, uint expiryBlockNumber) hostOnly(msg.sender) public {
    Voting voting = new Voting(title, optionTitles, expiryBlockNumber, msg.sender);
    VotingHostRegistry hostRegistry = VotingHostRegistry(votingHostRegistry);
    VotingRegistry registry = VotingRegistry(votingRegistry);
    registry.depositVoting(voting);
    emit newVoting(address(voting));
    if (hostRegistry.getMembership(msg.sender) == VotingHostRegistry.Membership.CITIZEN) {
      hostRegistry.setRecordForHost(msg.sender);
    }
  }

  function applyAsHost() public payable {
    VotingHostRegistry hostRegistry = VotingHostRegistry(votingHostRegistry);
    VotingHostRegistry.Membership memberType = _checkMembership(msg.value);
    hostRegistry.depositHost(msg.sender, memberType);
  }

  function _checkMembership(uint _value) internal pure returns (VotingHostRegistry.Membership) {
    require(_value == ONE_ETHER || _value == TEN_ETHERS);
    if (_value == ONE_ETHER) {
      return VotingHostRegistry.Membership.CITIZEN;
    } else if (_value == TEN_ETHERS) {
      return VotingHostRegistry.Membership.DIAMOND;
    }
  }

  function withdrawEther() adminOnly public {
    depositAccount.transfer(address(this).balance);
  }

  function ejectRegistry() adminOnly public {
    VotingHostRegistry hostRegistry = VotingHostRegistry(votingHostRegistry);
    VotingRegistry registry = VotingRegistry(votingRegistry);
    hostRegistry.setAdmin(admin);
    emit ejectVotingHostRegistry(votingHostRegistry);
    registry.setAdmin(admin);
    emit ejectVotingRegistry(votingRegistry);
  }
}
