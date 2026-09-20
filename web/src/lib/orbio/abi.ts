export const exchangeAbi = [
  {
    name: 'getActivationQuote',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { type: 'uint256', name: 'usdgIn' },
      { type: 'uint256', name: 'maxFills' },
    ],
    outputs: [
      {
        type: 'tuple',
        components: [
          { type: 'uint256', name: 'creditOut' },
          { type: 'uint256', name: 'usdgSpent' },
          { type: 'uint256', name: 'feeAtoms' },
          { type: 'uint256', name: 'fills' },
          { type: 'uint8', name: 'reason' },
        ],
      },
      { type: 'uint256', name: 'creditedAtoms' },
      { type: 'uint256', name: 'activationFeeAtoms' },
    ],
  },
  {
    name: 'buyAndActivate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'uint256', name: 'usdgIn' },
      { type: 'uint256', name: 'minCreditOut' },
      { type: 'bytes32', name: 'beneficiary' },
      { type: 'uint256', name: 'maxFills' },
    ],
    outputs: [
      { type: 'uint256', name: 'creditOut' },
      { type: 'uint256', name: 'usdgSpent' },
      { type: 'uint256', name: 'activationId' },
    ],
  },
  {
    name: 'MAX_FILLS',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'address', name: 'spender' },
      { type: 'uint256', name: 'amount' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'spender' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ type: 'address', name: 'account' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const creditAbi = [
  ...erc20Abi,
  {
    name: 'activate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { type: 'uint256', name: 'amount' },
      { type: 'bytes32', name: 'beneficiary' },
    ],
    outputs: [{ type: 'uint256', name: 'activationId' }],
  },
] as const
