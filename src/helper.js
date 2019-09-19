const BigNumber = require("bignumber.js");
const { getErc20Decimal } = require("./erc20");

const isEther = address =>
  address.toLowerCase() === "0x000000000000000000000000000000000000000e";

const isDai = address =>
  address.toLowerCase() === "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359";

const isUSDT = address =>
  address.toLowerCase() === "0xdac17f958d2ee523a2206206994597c13d831ec7";

const displayMarket = market => {
  console.group();
  console.log(`baseAsset: ${market.baseAsset}
quoteAsset: ${market.quoteAsset}
liquidateRate: ${toHumanReadablePercentage(market.liquidateRate)}
withdrawRate: ${toHumanReadablePercentage(market.withdrawRate)}
auctionRatioStart: ${toHumanReadablePercentage(market.auctionRatioStart)}
auctionRatioPerBlock: ${toHumanReadablePercentage(market.auctionRatioPerBlock)}
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

const displayAuction = async auction => {
  console.group();
  console.log(`borrower: ${auction.borrower}
marketID: ${auction.marketID}
debtAsset: ${auction.debtAsset}
collateralAsset: ${auction.collateralAsset}
leftDebtAmount: ${toHumanReadableStr(
    auction.leftDebtAmount,
    await getErc20Decimal(auction.debtAsset)
  )}
leftCollateralAmount: ${toHumanReadableStr(
    auction.leftCollateralAmount,
    await getErc20Decimal(auction.collateralAsset)
  )}
ratio: ${toHumanReadablePercentage(auction.ratio)}
price: ${toHumanReadableStr(auction.price)}
finished: ${auction.finished}
  `);
  console.groupEnd();
};

const toHumanReadableStr = (x, decimals = 18) =>
  new BigNumber(x).div(new BigNumber(10).pow(decimals)).toFixed(2);

const toHumanReadableDecimal = (x, decimals = 18) =>
  new BigNumber(x).div(new BigNumber(10).pow(decimals));

const toHumanReadablePercentage = x =>
  new BigNumber(x)
    .times(100)
    .div(new BigNumber(10).pow(18))
    .toFixed(2) + "%";

module.exports = {
  displayMarket,
  displayAsset,
  displayAuction,
  toHumanReadableStr,
  toHumanReadableDecimal,
  toHumanReadablePercentage,
  isEther,
  isDai
};
