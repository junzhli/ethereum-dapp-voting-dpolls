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

  uint constant ONE_ETHER = 1e18;
  uint constant TEN_ETHERS = 10 * 1e18;

  constructor(address _votingRegistry, address _votingHostRegistry, address payable _depositAccount) public {
    admin = msg.sender;
    votingRegistry = _votingRegistry;
    votingHostRegistry = _votingHostRegistry;
    depositAccount = _depositAccount;
  }

  modifier hostOnly(address _address) {
    VotingHostRegistry hostsRegistry = VotingHostRegistry(votingHostRegistry);
    require(hostsRegistry.isHost(_address));
    _;
  }

  function setDepositAccount(address payable _depositAccount) adminOnly public {
    depositAccount = _depositAccount;
  }

  function setVotingHostRegistry(address _votingHostsRegistry) adminOnly public {
    votingHostRegistry = _votingHostsRegistry;
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
    VotingHostRegistry hostsRegistry = VotingHostRegistry(votingHostRegistry);
    return uint(hostsRegistry.getMembership(_address));
  }

  function createVoting(bytes32 title, bytes32[] memory optionTitles, uint expiryBlockNumber) hostOnly(msg.sender) public {
    Voting voting = new Voting(title, optionTitles, expiryBlockNumber, msg.sender);
    VotingRegistry registry = VotingRegistry(votingRegistry);
    registry.depositVoting(voting);
    emit newVoting(address(voting));
  }

  function applyAsHost() public payable {
    VotingHostRegistry hostsRegistry = VotingHostRegistry(votingHostRegistry);
    VotingHostRegistry.Membership memberType = _checkMembership(msg.value);
    hostsRegistry.depositHost(msg.sender, memberType);
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
}
