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
          error.message.toString().indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenInstance.transfer
          .call(accounts[1], 250000, {
            from: accounts[0],
          })
          .then(function (success) {
            assert.equal(success, true, "it returns true");
            return tokenInstance.transfer(accounts[1], 250000, {
              from: accounts[0],
            });
          });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "there should be 1 event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "the event should be transfer"
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          "the sender hould be accounts[0]"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "the receiever should be accounts[1]"
        );
        assert.equal(
          receipt.logs[0].args._value,
          250000,
          "the value should be 250000"
        );

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

  // Testing the delagated transfer approval
  it("Approves tokens for delegated transfer", async function () {
    tokenInstance = await DappToken.deployed();
    let success = await tokenInstance.approve.call(accounts[1], 100);
    assert.equal(success, true, "it returns true");
    receipt = await tokenInstance.approve(accounts[1], 100, {
      from: accounts[0],
    });
    assert.equal(
      receipt.logs[0].event,
      "Approval",
      "the event should be Approval"
    );
    assert.equal(
      receipt.logs[0].args._from,
      accounts[0],
      "the one who approves should be accounts[0]"
    );
    assert.equal(
      receipt.logs[0].args._to,
      accounts[1],
      "the delegated spender should be accounts[1]"
    );
    assert.equal(
      receipt.logs[0].args._value,
      100,
      "the approved value should be 100"
    );
    let allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance, 100), "stores the allowance for delegated transfer";
  });

  // Testing the delagated transfer
  it("handles delgated token transfers", async function () {
    tokenInstance = await DappToken.deployed();
    let fromAccount = accounts[2];
    let toAccount = accounts[3];
    let spendingAccount = accounts[4]; //calls the function
    // transfer some tokens to fromAccount
    let receipt = await tokenInstance.transfer(fromAccount, 100, {
      from: accounts[0],
    });
    receipt = await tokenInstance.approve(spendingAccount, 10, {
      from: fromAccount,
    });
    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 999, {
        from: spendingAccount,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.toString().includes("revert"),
        "cannot transfer value greater than balance"
      );
    }
    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 20, {
        from: spendingAccount,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.toString().includes("revert"),
        "cannot transfer value greater than approved amount"
      );
    }
    success = await tokenInstance.transferFrom.call(fromAccount, toAccount, 1, {
      from: spendingAccount,
    });
    assert.equal(success, true, "should return true");
    receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, {
      from: spendingAccount,
    });
    assert.equal(receipt.logs.length, 1, "there should be 1 event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      "the event should be Transfer"
    );
    assert.equal(
      receipt.logs[0].args._from,
      accounts[2],
      "the from account should be accounts[2]"
    );
    assert.equal(
      receipt.logs[0].args._to,
      accounts[3],
      "the to account should be accounts[3]"
    );
    assert.equal(receipt.logs[0].args._value, 10, "the value should be 10");
    let remainingAllowance = await tokenInstance.allowance(
      fromAccount,
      spendingAccount
    );
    assert.equal(remainingAllowance, 0, "the remaining allowance should be 0");
    let fromBalance = await tokenInstance.balanceOf(fromAccount);
    let toBalance = await tokenInstance.balanceOf(toAccount);
    assert.equal(fromBalance, 90, "the from balance should be 90");
    assert.equal(toBalance, 10, "the to balance should be 10");
  });
});
