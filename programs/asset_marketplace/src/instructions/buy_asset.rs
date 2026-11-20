use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer as SystemTransfer},
};
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

use crate::{constants::*, error::ErrorCode, state::Listing};

#[derive(Accounts)]
pub struct BuyAsset<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// CHECK: Seller receives payment and rent; validated via listing.seller
    #[account(mut, address = listing.seller)]
    pub seller: UncheckedAccount<'info>,

    #[account(
        mut,
        close = seller,
        seeds = [LISTING_SEED, seller.key().as_ref(), asset_mint.key().as_ref()],
        bump = listing.bump,
        constraint = listing.is_active @ ErrorCode::ListingNotActive,
        constraint = listing.mint == asset_mint.key()
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        seeds = [VAULT_SEED, listing.key().as_ref()],
        bump = listing.vault_bump,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = buyer_token_account.mint == asset_mint.key(),
        constraint = buyer_token_account.owner == buyer.key()
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub asset_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handle_buy_asset(ctx: Context<BuyAsset>) -> Result<()> {
    let price = ctx.accounts.listing.price;
    let seller_key = ctx.accounts.listing.seller;
    let mint_key = ctx.accounts.listing.mint;
    let bump = ctx.accounts.listing.bump;

    let cpi_accounts = SystemTransfer {
        from: ctx.accounts.buyer.to_account_info(),
        to: ctx.accounts.seller.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.system_program.key(), cpi_accounts);
    transfer(cpi_ctx, price)?;

    let seeds = &[
        LISTING_SEED,
        seller_key.as_ref(),
        mint_key.as_ref(),
        &[bump],
    ];
    let signer = &[&seeds[..]];

    let transfer_accounts = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.buyer_token_account.to_account_info(),
        authority: ctx.accounts.listing.to_account_info(),
    };
    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        transfer_accounts,
        signer,
    );
    token::transfer(transfer_ctx, 1)?;

    let close_accounts = CloseAccount {
        account: ctx.accounts.vault_token_account.to_account_info(),
        destination: ctx.accounts.seller.to_account_info(),
        authority: ctx.accounts.listing.to_account_info(),
    };
    let close_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        close_accounts,
        signer,
    );
    token::close_account(close_ctx)?;

    Ok(())
}
