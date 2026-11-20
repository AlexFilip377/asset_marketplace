pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR");

#[program]
pub mod asset_marketplace {
    use super::*;

    pub fn list_asset(ctx: Context<ListAsset>, price: u64) -> Result<()> {
        crate::instructions::list_asset::handle_list_asset(ctx, price)
    }

    pub fn buy_asset(ctx: Context<BuyAsset>) -> Result<()> {
        crate::instructions::buy_asset::handle_buy_asset(ctx)
    }
}
