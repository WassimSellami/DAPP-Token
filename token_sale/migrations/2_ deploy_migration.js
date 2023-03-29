var DappToken = artifacts.require("./DappToken.sol");
var DappTokenSale = artifacts.require("./DappTokenSale.sol");
module.exports = function (deployer) {
  var initialSupply = 1000000;
  var tokenPrice = 1000000000000000; // 0.001 Ether
  deployer.deploy(DappToken, initialSupply).then(function () {
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  });
};
