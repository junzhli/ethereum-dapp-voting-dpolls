pragma solidity ^0.5.0;


contract Permissioned {
  address public admin;

  constructor() public {
    admin = msg.sender;
  }

  modifier adminOnly() {
    require(msg.sender == admin);
    _;
  }

  function setAdmin(address _admin) adminOnly public {
    admin = _admin;
  }
}
