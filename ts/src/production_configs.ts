import * as _ from 'lodash';

import { 
    Configs,
    EthereumRpcType,
    EthereumRpcConnectionMethod,
    ApiType 
} from './types';

export const configs: Configs = {
    // Chain Id to connect to
    CHAIN_ID: process.env.CHAIN_ID === undefined ? 1 : _.parseInt(process.env.CHAIN_ID),

    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL || "",
    
    ETHEREUM_RPC_TYPE: process.env.ETHEREUM_RPC_TYPE === undefined ? EthereumRpcType.Default : process.env.ETHEREUM_RPC_TYPE as EthereumRpcType,
    
    ETHEREUM_RPC_CONNECTION_METHOD:
        process.env.ETHEREUM_RPC_TYPE === undefined
            ? EthereumRpcConnectionMethod.Polling
            : process.env.ETHEREUM_RPC_CONNECTION_METHOD as EthereumRpcConnectionMethod,
    
    GAS_PRICE_SOURCE: process.env.ETHEREUM_RPC_URL || "ethgasstation",
    
    GAS_PRICE_POLL_RATE_MS:
        process.env.GAS_PRICE_POLL_RATE_MS === undefined ? 60000 : _.parseInt(process.env.GAS_PRICE_POLL_RATE_MS),
    
    RESTRICTED_TOKEN_PAIRS:
        process.env.RESTRICTED_TOKEN_PAIRS === undefined
        ? []
        : process.env.RESTRICTED_TOKEN_PAIRS.split(",").map(val => val.trim()),

    API_TYPE: ApiType.Bamboo,
    
    API_POLL_RATE: 60000
};