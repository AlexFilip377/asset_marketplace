/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 */
export type AssetMarketplace = {
  address: 'CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR'
  metadata: {
    name: 'assetMarketplace'
    version: '0.1.0'
    spec: '0.1.0'
    description: 'Created with Anchor'
  }
  instructions: [
    {
      name: 'buyAsset'
      discriminator: [197, 37, 177, 1, 180, 23, 175, 98]
      accounts: [
        { name: 'buyer'; writable: true; signer: true },
        { name: 'seller'; writable: true },
        { name: 'listing'; writable: true },
        { name: 'vaultTokenAccount'; writable: true },
        { name: 'buyerTokenAccount'; writable: true },
        { name: 'assetMint' },
        { name: 'tokenProgram'; address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ]
      args: []
    },
    {
      name: 'listAsset'
      discriminator: [11, 25, 254, 205, 61, 252, 23, 15]
      accounts: [
        { name: 'seller'; writable: true; signer: true },
        { name: 'listing'; writable: true },
        { name: 'vaultTokenAccount'; writable: true },
        { name: 'sellerTokenAccount'; writable: true },
        { name: 'assetMint' },
        { name: 'tokenProgram'; address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { name: 'systemProgram'; address: '11111111111111111111111111111111' },
      ]
      args: [{ name: 'price'; type: 'u64' }]
    },
  ]
  accounts: [
    {
      name: 'listing'
      discriminator: [218, 32, 50, 73, 43, 134, 26, 58]
    },
  ]
  errors: [
    { code: 6000; name: 'listingNotActive'; msg: 'Listing is not active' },
    { code: 6001; name: 'invalidPrice'; msg: 'Invalid listing price' },
  ]
  types: [
    {
      name: 'listing'
      type: {
        kind: 'struct'
        fields: [
          { name: 'seller'; type: 'pubkey' },
          { name: 'mint'; type: 'pubkey' },
          { name: 'price'; type: 'u64' },
          { name: 'bump'; type: 'u8' },
          { name: 'vaultBump'; type: 'u8' },
          { name: 'isActive'; type: 'bool' },
        ]
      }
    },
  ]
}
