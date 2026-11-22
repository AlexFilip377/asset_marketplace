import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  type Connection,
} from '@solana/web3.js'
import type { WalletContextState } from '@solana/wallet-adapter-react'
import type { AssetMarketplace } from './asset_marketplace'
import idlJson from './idl.json'

const idl = idlJson as unknown as AssetMarketplace

export const PROGRAM_ID = new PublicKey(
  'CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR',
)

export function listingPda(seller: PublicKey, mint: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), seller.toBuffer(), mint.toBuffer()],
    PROGRAM_ID,
  )[0]
}

export function vaultPda(listing: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), listing.toBuffer()],
    PROGRAM_ID,
  )[0]
}

function readProvider(connection: Connection) {
  return new AnchorProvider(
    connection,
    {
      publicKey: PublicKey.default,
      signTransaction: async (tx: unknown) => tx,
      signAllTransactions: async (txs: unknown) => txs,
    } as never,
    { commitment: 'confirmed' },
  )
}

export function getProgram(
  connection: Connection,
  wallet: WalletContextState,
) {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Подключите кошелёк')
  }
  const provider = new AnchorProvider(
    connection,
    wallet as never,
    { commitment: 'confirmed' },
  )
  return new Program<AssetMarketplace>(idl, provider)
}

export type ChainListing = {
  listingPda: PublicKey
  vaultPda: PublicKey
  seller: PublicKey
  mint: PublicKey
  price: BN
  isActive: boolean
}

export async function fetchListings(
  connection: Connection,
): Promise<ChainListing[]> {
  const program = new Program<AssetMarketplace>(idl, readProvider(connection))
  const rows = await program.account.listing.all()
  return rows
    .filter((r) => r.account.isActive)
    .map((r) => ({
      listingPda: r.publicKey,
      vaultPda: vaultPda(r.publicKey),
      seller: r.account.seller,
      mint: r.account.mint,
      price: r.account.price,
      isActive: r.account.isActive,
    }))
}

export async function listAssetOnChain(
  connection: Connection,
  wallet: WalletContextState,
  priceLamports: number,
) {
  if (!wallet.publicKey) throw new Error('Подключите кошелёк')
  const program = getProgram(connection, wallet)
  const mint = Keypair.generate()
  const seller = wallet.publicKey
  const ata = getAssociatedTokenAddressSync(mint.publicKey, seller)
  const listing = listingPda(seller, mint.publicKey)
  const vault = vaultPda(listing)
  const rent = await getMinimumBalanceForRentExemptMint(connection)

  await program.methods
    .listAsset(new BN(priceLamports))
    .accounts({
      seller,
      listing,
      vaultTokenAccount: vault,
      sellerTokenAccount: ata,
      assetMint: mint.publicKey,
    })
    .preInstructions([
      SystemProgram.createAccount({
        fromPubkey: seller,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: rent,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mint.publicKey, 0, seller, null),
      createAssociatedTokenAccountInstruction(
        seller,
        ata,
        seller,
        mint.publicKey,
      ),
      createMintToInstruction(mint.publicKey, ata, seller, 1),
    ])
    .signers([mint])
    .rpc()

  return {
    mint: mint.publicKey,
    listing,
    vault,
    seller,
  }
}

export async function buyAssetOnChain(
  connection: Connection,
  wallet: WalletContextState,
  item: { mint: string; seller: string; listingPda: string; vaultPda: string },
) {
  if (!wallet.publicKey) throw new Error('Подключите кошелёк')
  const program = getProgram(connection, wallet)
  const mint = new PublicKey(item.mint)
  const seller = new PublicKey(item.seller)
  const listing = new PublicKey(item.listingPda)
  const vault = new PublicKey(item.vaultPda)
  const buyerAta = getAssociatedTokenAddressSync(mint, wallet.publicKey)

  const pre = []
  try {
    await getAccount(connection, buyerAta)
  } catch {
    pre.push(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        buyerAta,
        wallet.publicKey,
        mint,
      ),
    )
  }

  const sig = await program.methods
    .buyAsset()
    .accounts({
      buyer: wallet.publicKey,
      seller,
      listing,
      vaultTokenAccount: vault,
      buyerTokenAccount: buyerAta,
      assetMint: mint,
    })
    .preInstructions(pre)
    .rpc()

  return sig
}
