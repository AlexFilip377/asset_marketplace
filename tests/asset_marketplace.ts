import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssetMarketplace } from "../target/types/asset_marketplace";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAssociatedTokenAccount, 
  mintTo, 
  getAccount 
} from "@solana/spl-token";
import { assert } from "chai";

describe("asset_marketplace", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AssetMarketplace as Program<AssetMarketplace>;

  const seller = anchor.web3.Keypair.generate();
  const buyer = anchor.web3.Keypair.generate();
  
  let assetMint: anchor.web3.PublicKey;
  let sellerTokenAccount: anchor.web3.PublicKey;
  let buyerTokenAccount: anchor.web3.PublicKey;
  
  let listingPda: anchor.web3.PublicKey;
  let vaultPda: anchor.web3.PublicKey;
  const price = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

  it("Подготовка окружения: выдача SOL и минт тестового ассета", async () => {
    const airdropSeller = await provider.connection.requestAirdrop(seller.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    const airdropBuyer = await provider.connection.requestAirdrop(buyer.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
    
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({ blockhash: latestBlockHash.blockhash, lastValidBlockHeight: latestBlockHash.lastValidBlockHeight, signature: airdropSeller });
    await provider.connection.confirmTransaction({ blockhash: latestBlockHash.blockhash, lastValidBlockHeight: latestBlockHash.lastValidBlockHeight, signature: airdropBuyer });

    assetMint = await createMint(provider.connection, seller, seller.publicKey, null, 0); // 0 decimals, так как предмет уникальный

    sellerTokenAccount = await createAssociatedTokenAccount(provider.connection, seller, assetMint, seller.publicKey);
    buyerTokenAccount = await createAssociatedTokenAccount(provider.connection, buyer, assetMint, buyer.publicKey);

    await mintTo(provider.connection, seller, assetMint, sellerTokenAccount, seller, 1);
  });

  it("Успешное выставление ассета на продажу (List Asset)", async () => {
    [listingPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), seller.publicKey.toBuffer(), assetMint.toBuffer()],
      program.programId
    );
    [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), listingPda.toBuffer()],
      program.programId
    );

    await program.methods
      .listAsset(price)
      .accounts({
        seller: seller.publicKey,
        listing: listingPda,
        vaultTokenAccount: vaultPda,
        sellerTokenAccount: sellerTokenAccount,
        assetMint: assetMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([seller])
      .rpc();

    const vaultAccount = await getAccount(provider.connection, vaultPda);
    assert.strictEqual(Number(vaultAccount.amount), 1);
  });

  it("Успешная покупка ассета (Buy Asset)", async () => {
    const sellerBalanceBefore = await provider.connection.getBalance(seller.publicKey);

    await program.methods
      .buyAsset()
      .accounts({
        buyer: buyer.publicKey,
        seller: seller.publicKey,
        listing: listingPda,
        vaultTokenAccount: vaultPda,
        buyerTokenAccount: buyerTokenAccount,
        assetMint: assetMint,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer])
      .rpc();

    const buyerAccountInfo = await getAccount(provider.connection, buyerTokenAccount);
    assert.strictEqual(Number(buyerAccountInfo.amount), 1);

    const sellerBalanceAfter = await provider.connection.getBalance(seller.publicKey);
    assert.isAbove(sellerBalanceAfter, sellerBalanceBefore);
  });
});