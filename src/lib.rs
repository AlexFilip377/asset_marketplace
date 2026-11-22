use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount, Token};


declare_id!("CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR");

#[program]
pub mod asset_marketplace {
    use super::*;

    pub fn list_asset(ctx: Context<ListAsset>, price: u64) -> Result<()> {
        let listing = &mut ctx.accounts.listing;

        listing.seller = ctx.accounts.seller.key();
        listing.asset_mint = ctx.accounts.asset_mint.key();
        listing.price = price;
        listing.bump = ctx.bumps.listing;

        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.seller_token_account.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        anchor_spl::token::transfer(cpi_ctx, 1)?; 

        Ok(())
    }

    pub fn buy_asset(ctx: Context<BuyAsset>) -> Result<()> {
        let listing = &ctx.accounts.listing;

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.seller.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, listing.price)?;

        let seller_key = listing.seller.key();
        let mint_key = listing.asset_mint.key();
        let bump = listing.bump;

        let signer_seeds: &[&[&[u8]]] = &[&[
            b"listing",
            seller_key.as_ref(),
            mint_key.as_ref(),
            &[bump],
        ]];

        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: listing.to_account_info(),
        };
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        
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

#[derive(Accounts)]
pub struct BuyAsset<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut, address = listing.seller)]
    pub seller: AccountInfo<'info>,

    #[account(
        mut,
        close = seller, 
        seeds = [b"listing", seller.key().as_ref(), asset_mint.key().as_ref()],
        bump = listing.bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        seeds = [b"vault", listing.key().as_ref()],
        bump,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    pub asset_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}