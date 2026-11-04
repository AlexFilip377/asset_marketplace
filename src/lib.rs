use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token};


declare_id!("CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR");

#[program]
pub mod asset_marketplace {
    use super::*;

}


#[account]
pub struct Listing {
    pub seller: Pubkey,     
    pub asset_mint: Pubkey, 
    pub price: u64,         
    pub bump: u8,           
}

impl Listing {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 1;
}

#[derive(Accounts)]
pub struct ListAsset<'info> {
    #[account(mut)]
    pub seller: Signer<'info>, // Пользователь, который подписывает транзакцию и платит за газ

    // Инициализируем PDA для хранения данных о конкретном товаре
    #[account(
        init,
        payer = seller,
        space = Listing::SPACE,
        seeds = [b"listing", seller.key().as_ref(), asset_mint.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    pub asset_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}