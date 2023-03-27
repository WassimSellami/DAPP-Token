var DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", function (accounts) {
  var tokenInstance;

  it("Initializes the contract with the correct values.", function () {
    return DappToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then(function (name) {
        assert.equal(name, "DApp Token", "Has the correct name.");
        return tokenInstance.symbol();
      })
      .then(function (symbol) {
        assert.equal(symbol, "DAPP", "Has the correct symbol.");
        return tokenInstance.standard();
      })
      .then(function (standard) {
        assert.equal(standard, "DApp Token v1.0", "Has the correct standard.");
      });
  });

  it("Allocates the initial supply upon deployment.", function () {
    return DappToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then(function (totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "sets the total supply to 1,000,000."
        );
        return tokenInstance
          .balanceOf(accounts[0])

          .then(function (adminSupply) {
            assert.equal(
              totalSupply.toNumber(),
              adminSupply,
              "allocates the initiail supply to the admin's balance."
            );
          });
      });
  });

  it("transfers token ownership", function () {
    return DappToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        // Test `require` statement first by transferring something larger than the sender's balance
        return tokenInstance.transfer.call(accounts[1], 99999999999);
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then(function (receipt) {
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          250000,
          "adds the amount to the receiving account"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          750000,
          "deducts the amount from the sending account"
        );
      });
  });
});
