export const ROBINHOOD_CHAIN_ID = 4663

export const ORBIO = {
  credit: '0xe33322da1380e61e5ae5dfb21e7f62924c73004c',
  exchange: '0x6951ffd32630b05e06f50062aea801625a58ebc0',
  usdg: '0x5fc5360d0400a0fd4f2af552add042d716f1d168',
} as const

/** CREDIT and USDG use 6 decimals per Orbio docs. */
export const ORBIO_TOKEN_DECIMALS = 6

export const robinhoodChain = {
  id: ROBINHOOD_CHAIN_ID,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.chain.robinhood.com'] },
  },
  blockExplorers: {
    default: {
      name: 'Robinhood Explorer',
      url: 'https://robin.etherscan.io',
    },
  },
} as const
