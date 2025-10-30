#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod descrow_contract {
    use ink::{prelude::string::String, primitives:: H160};
    use ink::storage::traits::StorageLayout;

    /// Simple escrow contract for buyer-seller transactions with an arbiter.
    ///
    /// Minimal changes: use AccountId-compatible types, unwrap Option values safely,
    /// and keep price as Balance so transferred_value (u128) compares directly.
    #[ink(storage)]
    pub struct DescrowContract {
        seller: H160,
        arbiter: H160,
        buyer: H160,
        price: Balance,
        state: State,
        /// When a dispute is opened this is set to `Some(deadline)` (in milliseconds)
        dispute_deadline: Option<Timestamp>,
        /// dispute window in milliseconds
        dispute_window_ms: Timestamp,
        /// description or metadata (optional)
        description: Option<String>,
    }

    #[derive(scale::Encode, scale::Decode, Clone, Copy, PartialEq, Eq, Debug)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub enum State {
        Created,
        Funded,
        Disputed,
        Closed,
    }

    /// Errors returned by the contract.
    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo, StorageLayout))]
    pub enum EscrowError {
        InvalidState,
        IncorrectAmount,
        NotBuyer,
        NotArbiter,
        TransferFailed,
        NoDeadline,
        NotTimedOut,
        NoRecipient,
    }

    impl DescrowContract {
        /// Creates a new escrow instance.
        #[ink(constructor)]
        pub fn new(
            seller: H160,
            arbiter: H160,
            price: Balance,
            dispute_window_ms: Timestamp,
            description: Option<String>,
        ) -> Self {
            Self {
                seller,
                arbiter,
                buyer: H160::zero(),
                price,
                state: State::Created,
                dispute_deadline: None,
                dispute_window_ms,
                description,
            }
        }

        /// Buyer stakes the agreed price. This is payable and must send exactly `price`.
        #[ink(message, payable)]
        pub fn stake(&mut self) -> Result<(), EscrowError> {
            if self.state != State::Created {
                return Err(EscrowError::InvalidState)
            }

            // transferred_value() returns Balance (u128). price is Balance too.
            let transferred = self.env().transferred_value();
            if transferred != self.price.into() {
                return Err(EscrowError::IncorrectAmount)
            }

            self.buyer = self.env().caller();
            self.state = State::Funded;
            Ok(())
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

    // Unit tests — unchanged logic, using DefaultEnvironment
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        #[ink::test]
        fn happy_path_buyer_confirms_works() {
            let accounts = default_accounts();
            let mut contract = DescrowContract::new(Some(accounts.bob), Some(accounts.charlie), 100, 10_000, Some(String::from("order-1")));

            // buyer (alice) stakes 100
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            assert_eq!(contract.stake(), Ok(()));
            assert_eq!(contract.get_state(), State::Funded);

            // buyer confirms delivery
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            test::set_account_balance::<ink::env::DefaultEnvironment>(contract.env().account_id(), 100);
            assert_eq!(contract.confirm_delivery(), Ok(()));
            assert_eq!(contract.get_state(), State::Closed);
        }

        #[ink::test]
        fn dispute_resolved_in_sellers_favour() {
            let accounts = default_accounts();
            let mut contract = DescrowContract::new(Some(accounts.bob), Some(accounts.charlie), 50, 10_000, None);

            // buyer stakes
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            test::set_value_transferred::<ink::env::DefaultEnvironment>(50);
            assert_eq!(contract.stake(), Ok(()));

            // buyer opens dispute
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(contract.open_dispute(), Ok(()));
            assert_eq!(contract.get_state(), State::Disputed);

            // set contract balance to allow transfer
            test::set_account_balance::<ink::env::DefaultEnvironment>(contract.env().account_id(), 50);

            // arbiter resolves in favour of seller
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
            assert_eq!(contract.resolve_dispute(true), Ok(()));
            assert_eq!(contract.get_state(), State::Closed);
        }

        #[ink::test]
        fn dispute_timeout_refunds_buyer() {
            let accounts = default_accounts();
            let mut contract = DescrowContract::new(Some(accounts.bob), Some(accounts.charlie), 75, 1_000, None);

            // buyer stakes
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            test::set_value_transferred::<ink::env::DefaultEnvironment>(75);
            assert_eq!(contract.stake(), Ok(()));

            // buyer opens dispute
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            assert_eq!(contract.open_dispute(), Ok(()));

            // advance time past deadline
            let deadline = contract.get_dispute_deadline().unwrap();
            test::advance_block::<ink::env::DefaultEnvironment>();
            test::set_block_timestamp::<ink::env::DefaultEnvironment>(deadline + 1);

            // set contract balance and call claim_timeout
            test::set_account_balance::<ink::env::DefaultEnvironment>(contract.env().account_id(), 75);
            assert_eq!(contract.claim_timeout(), Ok(()));
            assert_eq!(contract.get_state(), State::Closed);
        }
    }
}
