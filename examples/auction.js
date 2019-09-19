/**
 * This example shows how to participate auctions in hydro protocol v2 contract.
 *
 * TODO 💪
 */

const { toHumanReadableDecimal } = require("../src/helper");
const { getErc20Decimal } = require("../src/erc20");
const BigNumber = require("bignumber.js");

/*
You can always treat an auction as an limit order.
The order sell collateral asset for debt asset. The following
function shows how to calculate the order price and the maximum
debt asset you could pay, at current block and next block.
*/
const parseAuctionToOrder = async auctionID => {
  const rawAuctionInfo = await hydro.methods
    .getAuctionDetails(auctionId)
    .call();
  debtDecimal = await getErc20Decimal(rawAuctionInfo.debtAsset);
  collateralDecimal = await getErc20Decimal(rawAuctionInfo.collateralAsset);
  ratio = toHumanReadableDecimal(rawAuctionInfo.ratio);
  leftDebt = toHumanReadableDecimal(rawAuctionInfo.leftDebt, debtDecimal);
  leftCollateral = toHumanReadableDecimal(
    rawAuctionInfo.leftCollateral,
    collateralDecimal
  );
  price = leftDebt.div(leftCollateral).div(ratio);
  maxFillableDebt = ratio.gt(1) ? leftDebt.div(ratio) : leftDebt;

  const market = await hydro.methods.getMarket(rawAuctionInfo.marketID).call();
  ratioPerBlock = toHumanReadableDecimal(market.auctionRatioPerBlock);
  ratioNextBlock = ratio.plus(ratioPerBlock);
  priceNextBlock = leftDebt.div(leftCollateral).div(ratioNextBlock);
  maxFillableDebtNextBlock = ratioNextBlock.gt(1)
    ? leftDebt.div(ratioNextBlock)
    : leftDebt;

  return {
    debtAsset: rawAuctionInfo.debtAsset,
    collateralAsset: rawAuctionInfo.collateralAsset,
    price: price,
    maxFillableDebt: maxFillableDebt,
    priceNextBlock: priceNextBlock,
    maxFillableDebtNextBlock: maxFillableDebtNextBlock,
    ratio: ratio,
    ratioNextBlock: ratioNextBlock,
    ratioPerBlock: ratioPerBlock
  };
};

const fillAuction = async (bidderAddress, auctionID, fillAmount) => {
  var receipt;
  var filledDebt = new BigNumber(0);
  var filledCollateral = new BigNumber(0);
  await hydro.methods
    .fillAuctionWithAmount(auctionID, fillAmount)
    .send({ from: bidderAddress })
    .on("receipt", (receipt = res));
  if (receipt.status) {
    for (let log of receipt.logs) {
      if (
        log.topics[0] ==
        "0x42a553656a0da7239e70a4a3c864c1ac7d46d7968bfe2e1fb14f42dbb67135e8"
      ) {
        filledDebt = new BigNumber("0x" + log.data.slice(130, 194));
        filledCollateral = new BigNumber("0x" + log.data.slice(194, 258));
      }
    }
  }
  return {
    filledDebt: filledDebt,
    filledCollateral: filledCollateral
  };
};
