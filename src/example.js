const hydro = require("./hydro");
const { getErc20TokenContract } = require("./erc20");
const {
  displayMarket,
  displayAsset,
  isEther,
  toHumanReadableStr,
  toHumanReadablePercentage
} = require("./helper");

const assetsSet = new Set();
const BigNumber = require("bignumber.js");
const markets = [];
const assets = [];

const run = async () => {
  // get markets count
  const marketCount = await hydro.methods.getAllMarketsCount().call();
  console.log(
    `There are ${marketCount} ${
      marketCount > 1 ? "markets" : "market"
    } in hydro protocol contract.`
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
    } in hydro protocol contract.`
  );

  for (let i = 0; i < assetsArray.length; i++) {
    const assetAddress = assetsArray[i];
    const assetContract = getErc20TokenContract(assetAddress);

    const [symbol, decimals, asset, price] = await Promise.all([
      isEther(assetAddress) ? "ETH" : assetContract.methods.symbol().call(),
      isEther(assetAddress) ? 18 : assetContract.methods.decimals().call(),
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

  console.log(`In the funding pool`);

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
    console.log(`TotalSupply:`, toHumanReadableStr(totalSupply));
    console.log(`TotalBorrow:`, toHumanReadableStr(totalBorrow));
    console.log(
      `borrow interest rate:`,
      toHumanReadablePercentage(interestRates[0])
    );
    console.log(
      `supply interest rate:`,
      toHumanReadablePercentage(interestRates[1])
    );
    console.log(`insurance:`, toHumanReadableStr(insurance));

    console.groupEnd();
  }
};

run();
