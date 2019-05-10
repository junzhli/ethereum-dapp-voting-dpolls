pragma solidity ^0.5.0;
import './baseContracts/Permissioned.sol';

contract VotingHostRegistry is Permissioned {
  enum Membership { DEFAULT, CITIZEN, DIAMOND }
  uint constant MAX_TIMES_PER_HOST = 10;

  mapping(address => Membership) private hosts;
  mapping(address => uint) private usedTimes;
  mapping(address => bool) private hasApplied;

  function depositHost(address _address, Membership _level) adminOnly external {
    require(hasApplied[_address] != true);
    hosts[_address] = _level;
    hasApplied[_address] = true;
  }

  function setRecordForHost(address _address) adminOnly external {
    require(hasApplied[_address] == true);
    require(Membership.CITIZEN == hosts[_address]);
    if (++usedTimes[_address] >= MAX_TIMES_PER_HOST) {
        _setHostMembership(_address, Membership.DEFAULT);
    }
  }

  function _setHostMembership(address _address, Membership _newLevel) internal adminOnly {
    require(hasApplied[_address] == true);
    if (_newLevel == Membership.DEFAULT) {
        hasApplied[_address] = false;
        usedTimes[_address] = 0;
    }

    hosts[_address] = _newLevel;
  }

  function isHost(address _address) external view returns (bool) {
    return (uint(hosts[_address]) > 0);
  }

  function getMembership(address _address) external view returns (Membership) {
      return hosts[_address];
  }

  function getQuota(address _address) public view returns (uint) {
    require(Membership.CITIZEN == hosts[_address]);
    return (MAX_TIMES_PER_HOST - usedTimes[_address]);
  }
}
