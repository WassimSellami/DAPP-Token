// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8;

import "./DappToken.sol";

contract DappTokenSale {
    address public admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;
    uint public testi = 6;

    event Sell(address _buyer, uint256 _amount);

    constructor(DappToken _tokenContract, uint256 _tokenPrice) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(
            msg.value == _numberOfTokens * tokenPrice,
            "value is not equal to tokens"
        );
        require(
            tokenContract.balanceOf(address(this)) >= _numberOfTokens,
            "tokens aren't enough for this operation"
        );
        require(
            tokenContract.transfer(msg.sender, _numberOfTokens),
            "token transfer has failed"
        );
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin, "the sender should be an admin");
        tokenContract.transfer(admin, tokenContract.balanceOf(address(this)));
        //selfdestruct(payable(admin));
    }
}
