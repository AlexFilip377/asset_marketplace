use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Listing is not active")]
    ListingNotActive,
    #[msg("Invalid listing price")]
    InvalidPrice,
}
