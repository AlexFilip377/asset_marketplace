//! Placeholder: full marketplace integration tests live in `tests/asset_marketplace.ts`.
//! Rebuild with `anchor build` before running on-chain / LiteSVM tests.

#[test]
fn marketplace_program_id_is_set() {
    let program_id = asset_marketplace::id();
    assert_ne!(program_id, solana_pubkey::Pubkey::default());
}
