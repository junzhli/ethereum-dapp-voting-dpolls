pragma solidity ^0.5.0;
import './baseContracts/Permissioned.sol';
import './Voting.sol';
import './VotingRegistry.sol';
import './VotingHostsRegistry.sol';

contract VotingCore is Permissioned {
  address public votingsRegistry;
  address public votingHostsRegistry;
  address payable public depositAccount;

  event newVoting(address _voting);

  uint constant ONE_ETHER = 1e18;
  uint constant TEN_ETHERS = 10 * 1e18;

  constructor(address _votingsRegistry, address _votingHostsRegistry, address payable _depositAccount) public {
    admin = msg.sender;
    votingsRegistry = _votingsRegistry;
    votingHostsRegistry = _votingHostsRegistry;
    depositAccount = _depositAccount;
  }

  modifier hostOnly(address _address) {
    VotingHostsRegistry hostsRegistry = VotingHostsRegistry(votingHostsRegistry);
    require(hostsRegistry.isHost(_address));
    _;
  }

  function setDepositAccount(address payable _depositAccount) adminOnly public {
    depositAccount = _depositAccount;
  }

  function setVotingHostsRegistry(address _votingHostsRegistry) adminOnly public {
    votingHostsRegistry = _votingHostsRegistry;
  }

  function setVotingsRegistry(address _votingsRegistry) adminOnly public {
    votingsRegistry = _votingsRegistry;
  }

  function getAmountVotings() public view returns (uint) {
    VotingRegistry registry = VotingRegistry(votingsRegistry);
    return registry.getAmountVotings();
  }

  function getVotingItemByIndex(uint _index) public view returns (address) {
    VotingRegistry registry = VotingRegistry(votingsRegistry);
    return registry.getVotingItemByIndex(_index);
  }

  function getMembership(address _address) public view returns (uint) {
    VotingHostsRegistry hostsRegistry = VotingHostsRegistry(votingHostsRegistry);
    return uint(hostsRegistry.getMembership(_address));
  }

  function createVoting(bytes32 title, bytes32[] memory optionTitles, uint expiryBlockNumber) hostOnly(msg.sender) public {
    Voting voting = new Voting(title, optionTitles, expiryBlockNumber, msg.sender);
    VotingRegistry registry = VotingRegistry(votingsRegistry);
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
