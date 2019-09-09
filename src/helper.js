const BigNumber = require("bignumber.js");

const isEther = address =>
  address.toLowerCase() === "0x000000000000000000000000000000000000000e";

const isDai = address =>
  address.toLowerCase() === "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";

const displayMarket = market => {
  console.group();
  console.log(`baseAsset: ${market.baseAsset}
quoteAsset: ${market.quoteAsset}
liquidateRate: ${market.liquidateRate}
withdrawRate: ${market.withdrawRate}
auctionRatioStart: ${market.auctionRatioStart}
auctionRatioPerBlock: ${market.auctionRatioPerBlock}
borrowEnable: ${market.borrowEnable}
`);
  console.groupEnd();
};

const displayAsset = asset => {
  console.group();
  console.log(`address: ${asset.address}
symbol: ${asset.symbol}
decimals: ${asset.decimals}
lendingPoolToken: ${asset.lendingPoolToken}
priceOracle: ${asset.priceOracle}
interestModel: ${asset.interestModel}
current price(USD): ${asset.price}
`);
  console.groupEnd();
};

const toHumanReadableDecimal = (x, decimals = 18) =>
  new BigNumber(x).div(new BigNumber(10).pow(decimals)).toFixed(2);

const toHumanReadablePercentage = x =>
  new BigNumber(x)
    .times(100)
    .div(new BigNumber(10).pow(18))
    .toFixed(2) + "%";

module.exports = {
  displayMarket,
  displayAsset,
  toHumanReadableDecimal,
  toHumanReadablePercentage,
  isEther,
  isDai
};
