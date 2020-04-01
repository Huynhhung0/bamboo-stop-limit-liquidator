import { BigNumber } from '@0x/utils';
import { SignedOrder } from '@0x/types';

import { Oracles, Tokens, OrderSummary, OrderType, BambooSignedOrder } from '../types';
import { ZeroExOrderEntity } from '../entities/zero_ex_order_entity';
import oracles from '../addresses/oracles.json';
import tokens from '../addresses/tokens.json';

export const orderUtils = {
    isValidOrder: (order: BambooSignedOrder): boolean => {
        if (order.executionType !== "STOP-LIMIT") {
            return false;
        }
        const chainOracles = (oracles as Oracles)[order.signedOrder.chainId.toString()];
        const chainTokens = (tokens as Tokens)[order.signedOrder.chainId.toString()];

        const baseToken = chainTokens.find(el => el.address === order.baseTokenAddress);
        const quoteToken = chainTokens.find(el => el.address === order.quoteTokenAddress);

        if (!baseToken || !quoteToken) {
            return false;
        }

        const oracle = chainOracles.find(el => el.baseToken === baseToken.symbol && el.quoteToken === quoteToken.symbol);
    },
    isOrderProfitable: (
        orderSummary: OrderSummary,
        price: BigNumber,
        gasPrice: BigNumber,
        ethFiatPrice: BigNumber,
        tokenFiatPrice: BigNumber,
        minimumProfitPercentage: BigNumber
    ): boolean => {
        if (orderSummary.minPrice.lt(price) || orderSummary.maxPrice.gt(price)) {
            return false;
        }

        const priceDifference = orderSummary.orderType === OrderType.Buy
            ? orderSummary.orderPrice.minus(price)
            : price.minus(orderSummary.orderPrice);

        const tradeProfit = orderSummary.orderType === OrderType.Buy
            ? orderSummary.makerAssetAmount.times(priceDifference)
            : orderSummary.takerAssetAmount.times(priceDifference);

        const takerAmountProfit = orderSummary.orderType === OrderType.Buy
            ? tradeProfit.times(orderSummary.makerAssetAmount.dividedBy(orderSummary.takerAssetAmount).integerValue(BigNumber.ROUND_FLOOR))
            : tradeProfit;

        const takerProfit = takerAmountProfit.minus(orderSummary.takerFee);

        // Decimals
        const takerFiatProfit = orderSummary.orderType === OrderType.Buy
            ? takerProfit.dividedBy(tokenFiatPrice)
            : takerProfit.times(tokenFiatPrice);

        // Asume atomic match, i.e. two ZeroExORders
        const protocolFeeFiat = new BigNumber(150000).times(gasPrice).times(2).shiftedBy(-18).times(ethFiatPrice);

        // Estimate
        const gasCostFiat = new BigNumber(300000).times(gasPrice).times(2).shiftedBy(-18).times(ethFiatPrice);

        const fiatProfit = takerFiatProfit.minus(protocolFeeFiat).minus(gasCostFiat);

        return fiatProfit.gt(0) && fiatProfit.dividedBy(takerFiatProfit).times(100).gte(minimumProfitPercentage);
    },
    async isTradeProfitable(stopLimitOrder: SignedOrder, matchedOrders: SignedOrder[]): Promise<boolean> {
        return false;
    },
    deserializeOrder: (signedOrderEntity: ZeroExOrderEntity): SignedOrder => {
        return {
            signature: signedOrderEntity.signature,
            senderAddress: signedOrderEntity.senderAddress,
            makerAddress: signedOrderEntity.makerAddress,
            takerAddress: signedOrderEntity.takerAddress,
            makerFee: new BigNumber(signedOrderEntity.makerFee),
            takerFee: new BigNumber(signedOrderEntity.takerFee),
            makerAssetAmount: new BigNumber(signedOrderEntity.makerAssetAmount),
            takerAssetAmount: new BigNumber(signedOrderEntity.takerAssetAmount),
            makerAssetData: signedOrderEntity.makerAssetData,
            takerAssetData: signedOrderEntity.takerAssetData,
            salt: new BigNumber(signedOrderEntity.salt),
            exchangeAddress: signedOrderEntity.exchangeAddress,
            feeRecipientAddress: signedOrderEntity.feeRecipientAddress,
            expirationTimeSeconds: new BigNumber(signedOrderEntity.expirationTimeSeconds),
            makerFeeAssetData: signedOrderEntity.makerFeeAssetData,
            takerFeeAssetData: signedOrderEntity.takerFeeAssetData,
            chainId: signedOrderEntity.chainId,
        };
    },
};