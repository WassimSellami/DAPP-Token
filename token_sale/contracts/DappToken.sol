//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8;

contract DappToken {
    uint256 public totalSupply;
    string public name = "DApp Token";
    string public symbol = "DAPP";
    string public standard = "DApp Token v1.0";

    event Transfer(address indexed _from, address indexed _to, uint value);

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(
            balanceOf[msg.sender] >= _value,
            "Sender's balance isn't enough for this transaction."
        );
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // emit Transfer(msg.sender, _to, _value);
        // success = true;
    }
}
