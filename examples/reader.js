/**
 * This example shows how to read status from hydro protocol v2 contract.
 * `exampleShowMarketStatus` is used to get global status.
 * `exampleShowAccountStatus` is used to get personal status.
 * `exampleShowAuctionStatus` is used to get current auction status of a market.
 */

const hydro = require("../src/hydro");
const { web3 } = require("../src/web3");
const {
  getErc20TokenContract,
  getErc20Decimal,
  getErc20Symbol
} = require("../src/erc20");
const {
  displayMarket,
  displayAsset,
  displayAuction,
  isEther,
  toHumanReadableStr,
  toHumanReadablePercentage
} = require("../src/helper");

const assetsSet = new Set();
const BigNumber = require("bignumber.js");
const markets = [];
const assets = [];

const exampleShowMarketStatus = async () => {
  // get markets count
  const marketCount = await hydro.methods.getAllMarketsCount().call();
  console.log(
    `There are ${marketCount} ${
      marketCount > 1 ? "markets" : "market"
    } in hydro protocol contract.\n`
  );

  for (let i = 0; i < marketCount; i++) {
    console.log(`Market #${i}:`);
    // get single market
    const market = await hydro.methods.getMarket(i).call();
    displayMarket(market);
    assetsSet.add(market.baseAsset);
    assetsSet.add(market.quoteAsset);

    market.id = i;
    markets.push(market);
  }

  const assetsArray = Array.from(assetsSet);
  console.log(
    `There are ${assetsArray.length} ${
      assetsArray.length > 1 ? "assets" : "asset"
    } in hydro protocol contract.\n`
  );

  for (let i = 0; i < assetsArray.length; i++) {
    const assetAddress = assetsArray[i];

    const [symbol, decimals, asset, price] = await Promise.all([
      getErc20Symbol(assetAddress),
      getErc20Decimal(assetAddress),
      hydro.methods.getAsset(assetAddress).call(), // get Asset
      hydro.methods.getAssetOraclePrice(assetAddress).call() // get Asset oracle price
    ]);

    asset.symbol = symbol;
    asset.decimals = decimals;
    asset.address = assetAddress;

    asset.price = new BigNumber(price)
      .div(new BigNumber(10).pow(18 + 18 - decimals))
      .toFixed(2);

    console.log(`Asset #${i} ${asset.symbol}:`);
    displayAsset(asset);

    assets.push(asset);
  }

  console.log(`In the funding pool:\n`);

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];

    const [
      totalBorrow,
      totalSupply,
      interestRates,
      insurance
    ] = await Promise.all([
      hydro.methods.getTotalBorrow(asset.address).call(), // get total borrow
      hydro.methods.getTotalSupply(asset.address).call(), // get total supply
      hydro.methods.getInterestRates(asset.address, 0).call(), // get intereset rates
      hydro.methods.getInsuranceBalance(asset.address).call() // get insurance balance
    ]);
    console.log(`${asset.symbol}`);
    console.group();
    console.log(
      `TotalSupply:`,
      toHumanReadableStr(totalSupply, asset.decimals)
    );
    console.log(
      `TotalBorrow:`,
      toHumanReadableStr(totalBorrow, asset.decimals)
    );
    console.log(
      `borrow interest rate:`,
      toHumanReadablePercentage(interestRates[0])
    );
    console.log(
      `supply interest rate:`,
      toHumanReadablePercentage(interestRates[1])
    );
    console.log(`insurance:`, toHumanReadableStr(insurance, asset.decimals));

    console.groupEnd();
    console.log();
  }

  console.log(`Hydro v2 Contract is stacking:\n`);
  console.group();
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const assetContract = getErc20TokenContract(asset.address);
    let balance;
    if (isEther(asset.address)) {
      balance = await web3.eth.getBalance(hydro._address);
    } else {
      balance = await assetContract.methods.balanceOf(hydro._address).call();
    }

    const balanceString = new BigNumber(balance)
      .div(new BigNumber(10).pow(asset.decimals))
      .toFixed(2);

    console.log(`${asset.symbol} ${balanceString}`);
  }
  console.groupEnd();
  console.log();
};

const exampleShowAccountStatus = async address => {
  console.log(`Let's show status for address ${address}\n`);

  for (let i = 0; i < markets.length; i++) {
    console.log(`In market #${i}`);

    const market = markets[i];
    const baseAsset = assets.find(x => x.address === market.baseAsset);
    const quoteAsset = assets.find(x => x.address === market.quoteAsset);

    const [
      liquidatable,
      details,
      baseBalance,
      quoteBalance,
      baseDebt,
      quoteDebt
    ] = await Promise.all([
      hydro.methods.isAccountLiquidatable(address, i).call(),
      hydro.methods.getAccountDetails(address, i).call(),
      hydro.methods.marketBalanceOf(i, market.baseAsset, address).call(),
      hydro.methods.marketBalanceOf(i, market.quoteAsset, address).call(),
      hydro.methods.getAmountBorrowed(market.baseAsset, address, i).call(),
      hydro.methods.getAmountBorrowed(market.quoteAsset, address, i).call()
    ]);

    console.group();
    console.log(`liquidatable: ${liquidatable}`);
    console.log(
      `base balance: ${toHumanReadableStr(baseBalance, baseAsset.decimals)} ${
        baseAsset.symbol
      }`
    );
    console.log(
      `base debt: ${toHumanReadableStr(baseDebt, baseAsset.decimals)} ${
        baseAsset.symbol
      }`
    );
    console.log(
      `quote balance: ${toHumanReadableStr(
        quoteBalance,
        quoteAsset.decimals
      )} ${quoteAsset.symbol}`
    );
    console.log(
      `quote debt: ${toHumanReadableStr(quoteDebt, quoteAsset.decimals)} ${
        quoteAsset.symbol
      }`
    );
    console.log(`liquidatable: ${liquidatable}`);
    console.groupEnd();
  }
  console.log();
  console.log(`In trading account, he(she) has:`);
  console.group();
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    let balance = await hydro.methods.balanceOf(asset.address, address).call();

    console.log(
      `${asset.symbol}: ${toHumanReadableStr(balance, asset.decimals)}`
    );
  }
  console.groupEnd();

  console.log();
  console.log(`In funding pool, he(she) has:`);
  console.group();
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const balance = await hydro.methods
      .getAmountSupplied(asset.address, address)
      .call();
    console.log(
      `${asset.symbol}: ${toHumanReadableStr(balance, asset.decimals)}`
    );
  }
  console.groupEnd();
};

const exampleShowAuctionStatus = async () => {
  const auctionCount = await hydro.methods.getAuctionsCount().call();
  const currentAuctionIds = await hydro.methods.getCurrentAuctions().call();
  console.log(
    `\nThere are ${auctionCount -
      currentAuctionIds.length} auctions happened in the past. ${
      currentAuctionIds.length
    } auctions in progress\n`
  );

  for (let auctionId of currentAuctionIds) {
    const auction = await hydro.methods.getAuctionDetails(auctionId).call();
    console.log(`In progress auction #${auctionId}`);
    await displayAuction(auction);
  }
};

const runExamples = async () => {
  await exampleShowMarketStatus();
  const exampleAddress = "0x1A671e90dB05AF4B128Ac4faEF01F5A36De468ad";
  await exampleShowAccountStatus(exampleAddress);
  await exampleShowAuctionStatus();
};

runExamples();
