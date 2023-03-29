var DappTokenSale = artifacts.require("./DappTokenSale.sol");
var DappToken = artifacts.require("./DappToken.sol");

contract("DappTokenSale", function (accounts) {
  var tokenPrice = 1000000000000000;
  var tokenSaleInstance;
  it("initializes token sale contract", async function () {
    tokenSaleInstance = await DappTokenSale.deployed();
    let contractAddress = await tokenSaleInstance.address;
    assert.notEqual(contractAddress, 0x0, "has contract address");
    let tokenContractAddress = await tokenSaleInstance.tokenContract();
    assert.notEqual(tokenContractAddress, 0x0, "has token contract address");
    let tokenPrice = await tokenSaleInstance.tokenPrice();
    assert.equal(tokenPrice, tokenPrice, "has correct tokenPrice");
  });

  it("facilitates token buying", async function () {
    tokenSaleInstance = await DappTokenSale.deployed();
    var tokenInstance = await DappToken.deployed();
    let admin = accounts[0];
    let buyer = accounts[1];
    numberOfTokens = 10;
    let tokensAvailable = 750000;
    // transfer 75% of total supply to token sell
    receipt = await tokenInstance.transfer(
      tokenSaleInstance.address,
      tokensAvailable,
      {
        from: admin,
      }
    );

    // verify that sell event is emitted
    receipt = await tokenSaleInstance.buyTokens(numberOfTokens, {
      from: buyer,
      value: numberOfTokens * tokenPrice,
    });
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Sell", 'should be the "Sell" event');
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      "logs the account that purchased the tokens"
    );
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      "logs the number of tokens purchased"
    );
    // verify the amount sold out.
    let tokensSold = await tokenSaleInstance.tokensSold();
    assert.equal(tokensSold, numberOfTokens, "the number of tokens sold");
    let buyerBalance = await tokenInstance.balanceOf(buyer);
    assert.equal(
      buyerBalance,
      numberOfTokens,
      "the buyer balance should increase"
    );
    let tokenSaleBalance = await tokenInstance.balanceOf(
      tokenSaleInstance.address
    );
    assert.equal(
      tokenSaleBalance,
      tokensAvailable - numberOfTokens,
      "the token sale balance should reduce"
    );
    try {
      await tokenSaleInstance.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.toString().includes("revert"),
        "the msg.value must equal to number of tokens value in wei"
      );
    }
    try {
      await tokenSaleInstance.buyTokens(800000, {
        from: buyer,
        value: 800000 * tokenPrice,
      });
      assert.fail();
    } catch (error) {
      console.log(error.message);
      assert(
        error.message.toString().includes("revert"),
        "there should be enough tokens in the tokenSale balance"
      );
    }
  });
});
