use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, error::ErrorCode, state::Listing};

#[derive(Accounts)]
pub struct ListAsset<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        init,
        payer = seller,
        space = 8 + Listing::INIT_SPACE,
        seeds = [LISTING_SEED, seller.key().as_ref(), asset_mint.key().as_ref()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        init,
        payer = seller,
        seeds = [VAULT_SEED, listing.key().as_ref()],
        bump,
        token::mint = asset_mint,
        token::authority = listing
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = seller_token_account.mint == asset_mint.key(),
        constraint = seller_token_account.owner == seller.key(),
        constraint = seller_token_account.amount >= 1
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    pub asset_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handle_list_asset(ctx: Context<ListAsset>, price: u64) -> Result<()> {
    require!(price > 0, ErrorCode::InvalidPrice);

    let listing = &mut ctx.accounts.listing;
    listing.seller = ctx.accounts.seller.key();
    listing.mint = ctx.accounts.asset_mint.key();
    listing.price = price;
    listing.bump = ctx.bumps.listing;
    listing.vault_bump = ctx.bumps.vault_token_account;
    listing.is_active = true;

    let cpi_accounts = Transfer {
        from: ctx.accounts.seller_token_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info().key(), cpi_accounts);
    token::transfer(cpi_ctx, 1)?;

    Ok(())
}
