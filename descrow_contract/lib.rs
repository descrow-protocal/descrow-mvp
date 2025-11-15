#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod descrow_contract {
    // use ink::env::call::state;
    use ink::{prelude::string::String, primitives:: H160};
    use ink::storage::traits::StorageLayout;

    /// Simple escrow contract for buyer-seller transactions with an arbiter.
    ///
    /// Minimal changes: use AccountId-compatible types, unwrap Option values safely,
    /// and keep price as Balance so transferred_value (u128) compares directly.
    #[ink(storage)]
    pub struct DescrowContract {

        buyer: Option<H160>,
        staking_amount: Option<Balance>,
        state: State,
    }
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub enum EscrowError {
        InvalidState,
        IncorrectAmount,
        NotBuyer,
        NotArbiter,
        NoDeadline,
        NotTimedOut,
        TransferFailed,
        LessThanStakingAmount,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo,StorageLayout))]
    pub enum State {
        Created,
        Funded,
        Disputed,
        Closed,
    }


    impl DescrowContract {
        /// Creates a new escrow instance.
        #[ink(constructor)]
        pub fn new(
            buyer: Option<H160>,
            staking_amount: Option<Balance>,
            state: State,
        ) -> Self {
            Self {
                buyer,
                staking_amount,
                state,
            }
        }

        /// Buyer stakes the agreed price. This is payable and must send exactly `price`.
        #[ink(message, payable)]
        pub fn stake(&mut self) -> Result< String, EscrowError> {
            if self.state != State::Created {
                return Err(EscrowError::InvalidState)
            }

            // Getting the required amount.
            let required_amount = match self.staking_amount {
                Some(amount) => amount,
                None => return Err(EscrowError::IncorrectAmount),
            };
            

            // transferred_value() returns Balance (u128). price is Balance too.
            let transferred = self.env().transferred_value();

            if transferred < required_amount.into() {
                return Err(EscrowError::LessThanStakingAmount);
            }

            // All good — set buyer and mark as funded
            self.buyer = Some(self.env().caller());
            self.state = State::Funded;

            Ok(String::from("Staked successfully!"))
            
        }

        /// Buyer confirms delivery and releases funds to the seller.
        #[ink(message)]
        pub fn confirm_delivery(&mut self) -> Result<(), EscrowError> {
            let caller: H160 = self.env().caller();
            if caller != self.buyer {
                return Err(EscrowError::NotBuyer)
            }
            if self.state != State::Funded {
                return Err(EscrowError::InvalidState)
            }

            // This might need to be changed to accomodate when the seller is not set. 
            // Define the seller as Option<H160> if needed.
            let seller = self.seller;
            self.transfer_to(seller, self.price)?;
            self.state = State::Closed;
            Ok(())
        }

        /// Buyer opens a dispute. Only the buyer can call this.
        #[ink(message)]
        pub fn open_dispute(&mut self) -> Result<(), EscrowError> {
            let caller: H160 = self.env().caller();
            if caller != self.buyer {
                return Err(EscrowError::NotBuyer)
            }
            if self.state != State::Funded {
                return Err(EscrowError::InvalidState)
            }

            let now = self.env().block_timestamp();
            let deadline = now + self.dispute_window_ms;
            self.dispute_deadline = Some(deadline);
            self.state = State::Disputed;
            Ok(())
        }

        /// Arbiter resolves the dispute. `in_favour_seller` true -> pay seller, else refund buyer.
        #[ink(message)]
        pub fn resolve_dispute(&mut self, in_favour_seller: bool) -> Result<(), EscrowError> {
            let caller: H160 = self.env().caller();
            if caller != self.arbiter {
                return Err(EscrowError::NotArbiter)
            }
            if self.state != State::Disputed {
                return Err(EscrowError::InvalidState)
            }

            if in_favour_seller {
                // This might need to be changed to accomodate when the seller is not set. 
            // Define the buyer as Option<H160> if needed.
                let seller = self.seller;
                self.transfer_to(seller, self.price)?;
            } else {
                let buyer = self.buyer;
                self.transfer_to(buyer, self.price)?;
            }
            self.state = State::Closed;
            Ok(())
        }

        /// If arbiter doesn't act before deadline, anyone can call to refund buyer.
        #[ink(message)]
        pub fn claim_timeout(&mut self) -> Result<(), EscrowError> {
            if self.state != State::Disputed {
                return Err(EscrowError::InvalidState)
            }
            let now = self.env().block_timestamp();
            let deadline = self.dispute_deadline.ok_or(EscrowError::NoDeadline)?;
            if now < deadline {
                return Err(EscrowError::NotTimedOut)
            }

            let buyer = self.buyer;
            self.transfer_to(buyer, self.price)?;
            self.state = State::Closed;
            Ok(())
        }

        /// Helper to transfer balance from contract to `to`.
        fn transfer_to(&mut self, to: H160, amount: Balance) -> Result<(), EscrowError> {
            match self.env().transfer(to, amount.into()) {
                Ok(()) => Ok(()),
                Err(_) => Err(EscrowError::TransferFailed),
            }
        }

        // --- getters ---

        #[ink(message)]
        pub fn get_seller(&self) -> H160 {
            self.seller
        }

        #[ink(message)]
        pub fn get_arbiter(&self) -> H160 {
            self.arbiter
        }

        #[ink(message)]
        pub fn get_buyer(&self) -> H160 {
            self.buyer
        }

        #[ink(message)]
        pub fn get_price(&self) -> Balance {
            self.price
        }

        #[ink(message)]
        pub fn get_state(&self) -> State {
            self.state
        }

        #[ink(message)]
        pub fn get_dispute_deadline(&self) -> Option<Timestamp> {
            self.dispute_deadline
        }
    }

    // Unit tests 
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<ink::env::DefaultEnvironment>()
        }
    }
}
