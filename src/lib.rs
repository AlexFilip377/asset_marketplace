use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token};


declare_id!("CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR");

#[program]
pub mod asset_marketplace {
    use super::*;

    pub fn list_asset(ctx: Context<ListAsset>, price: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        
        // 1. Записываем данные в PDA аккаунт
        listing.seller = ctx.accounts.seller.key();
        listing.asset_mint = ctx.accounts.asset_mint.key();
        listing.price = price;
        listing.bump = ctx.bumps.listing;

        // 2. CPI: Переводим токен от продавца в Vault смарт-контракта
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        // Переводим 1 единицу токена (так как это уникальная моделька/ассет)
        anchor_spl::token::transfer(cpi_ctx, 1)?; 

        Ok(())
    }
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
    pub seller: Signer<'info>,

    #[account(
        init,
        payer = seller,
        space = Listing::SPACE,
        seeds = [b"listing", seller.key().as_ref(), asset_mint.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        init,
        payer = seller,
        token::mint = asset_mint,
        token::authority = listing, 
        seeds = [b"vault", listing.key().as_ref()],
        bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    pub asset_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}