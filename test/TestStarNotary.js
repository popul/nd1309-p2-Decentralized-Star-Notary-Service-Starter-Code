const StarNotary = artifacts.require("StarNotary");

contract("StarNotary", (accs) => {
  const accounts = accs;
  let starNotary;

  beforeEach(async () => {
    starNotary = await StarNotary.new();
  });

  it("can Create a Star", async () => {
    let tokenId = 1;
    await starNotary.createStar("Awesome Star!", tokenId, { from: accounts[0] });
    assert.equal(
      await starNotary.tokenIdToStarInfo.call(tokenId),
      "Awesome Star!"
    );
  });

  it("lets user1 put up their star for sale", async () => {
    let user1 = accounts[1];
    let starId = 1;
    let starPrice = web3.utils.toWei(".01", "ether");
    await starNotary.createStar("awesome star", starId, { from: user1 });
    await starNotary.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await starNotary.starsForSale.call(starId), starPrice);
  });

  it("lets user1 get the funds after the sale", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 1;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await starNotary.createStar("awesome star", starId, { from: user1 });
    await starNotary.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await starNotary.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
  });

  it("lets user2 buy a star, if it is put up for sale", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 1;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await starNotary.createStar("awesome star", starId, { from: user1 });
    await starNotary.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await starNotary.buyStar(starId, { from: user2, value: balance });
    assert.equal(await starNotary.ownerOf.call(starId), user2);
  });

  it("lets user2 buy a star and decreases its balance in ether", async () => {
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 1;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await starNotary.createStar("awesome star", starId, { from: user1 });
    await starNotary.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await starNotary.buyStar(starId, {
      from: user2,
      value: balance,
      gasPrice: 0,
    });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value =
      Number(balanceOfUser2BeforeTransaction) -
      Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
  });

  // Implement Task 2 Add supporting unit tests

  it("can add the star name and star symbol properly", async () => {
    let tokenId = 1;
    await starNotary.createStar("Awesome Star!", tokenId, { from: accounts[0] });
    assert.equal(await starNotary.name.call(), "Star");
    assert.equal(await starNotary.symbol.call(), "STR");
  });

  it("lets 2 users exchange stars", async () => {
    // 1. create 2 Stars with different tokenId
    await starNotary.createStar("Awesome Star 1!", 1, { from: accounts[0] });
    await starNotary.createStar("Awesome Star 2!", 2, { from: accounts[1] });

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await starNotary.exchangeStars(1, 2, { from: accounts[0] })

    // 3. Verify that the owners changed
    assert.equal(await starNotary.ownerOf.call(1), accounts[1], "star with token id 1 should be owned by account[1]");
    assert.equal(await starNotary.ownerOf.call(2), accounts[0], "star with token id 2 should be owned by account[0]");
  });

  it("lets a user transfer a star", async () => {
    // 1. create a Star with different tokenId
    await starNotary.createStar("Awesome Star !", 1, { from: accounts[0] });
    // 2. use the transferStar function implemented in the Smart Contract
    await starNotary.transferStar(accounts[1], 1, { from: accounts[0] });
    // 3. Verify the star owner changed.
    assert.equal(await starNotary.ownerOf.call(1), accounts[1], "start with token id 1 should be transfered to accounts[1]");
  });

  it("lookUptokenIdToStarInfo test", async () => {
    // 1. create a Star with different tokenId
    await starNotary.createStar("Awesome Star 1!", 1, { from: accounts[0] });

    // 2. Call your method lookUptokenIdToStarInfo
    const starName = await starNotary.lookUptokenIdToStarInfo(1, { from: accounts[0] });

    // 3. Verify if you Star name is the same
    assert.equal("Awesome Star 1!", starName);
    
    // 4. Throw exception on unknown token id
    let throwExp = false;
    try {
        await starNotary.lookUptokenIdToStarInfo(123, { from: accounts[0] });
    } catch (e) {
        throwExp = true;
    }

    assert.isOk(throwExp, "Should throw an exception on unknown token id");
  });
});
