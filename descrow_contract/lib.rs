#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod descrow_contract {
    use ink::prelude::string::String;

    /// Simple escrow contract for buyer-seller transactions with an arbiter.
    ///
    /// Features:
    /// - Buyer stakes the agreed price (payable message).
    /// - Buyer confirms delivery -> funds sent to seller.
    /// - Buyer can open a dispute which sets a dispute deadline.
    /// - Arbiter resolves dispute in favor of buyer or seller before deadline.
    /// - If arbiter doesn't resolve before deadline, anyone can call `claim_timeout`
    ///   which refunds the buyer and closes the contract.
    #[ink(storage)]
    pub struct DescrowContract {
        seller: AccountId,
        arbiter: AccountId,
        buyer: Option<AccountId>,
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
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum State {
        Created,
        Funded,
        Disputed,
        Closed,
    }

    impl DescrowContract {
        /// Creates a new escrow instance.
        /// `seller` - recipient if delivery is confirmed or arbiter rules for seller.
        /// `arbiter` - account allowed to resolve disputes.
        /// `price` - expected amount (in the chain's base balance unit).
        /// `dispute_window_ms` - how long the arbiter has to resolve after a dispute (ms).
        #[ink(constructor)]
        pub fn new(
            seller: AccountId,
            arbiter: AccountId,
            price: Balance,
            dispute_window_ms: Timestamp,
            description: Option<String>,
        ) -> Self {
            Self {
                seller,
                arbiter,
                buyer: None,
                price,
                state: State::Created,
                dispute_deadline: None,
                dispute_window_ms,
                description,
            }
        }

        /// Buyer stakes the agreed price. This is a payable method and must send exactly `price`.
        /// Ensures caller has provided the funds with the call (we can't check off-chain balances).
        #[ink(message, payable)]
        pub fn stake(&mut self) -> Result<(), EscrowError> {
            if self.state != State::Created {
                return Err(EscrowError::InvalidState)
            }
            let transferred = self.env().transferred_value();
            if transferred != self.price {
                return Err(EscrowError::IncorrectAmount)
            }
            let caller = self.env().caller();
            self.buyer = Some(caller);
            self.state = State::Funded;
            Ok(())
        }

        /// Buyer confirms delivery and releases funds to the seller.
        #[ink(message)]
        pub fn confirm_delivery(&mut self) -> Result<(), EscrowError> {
            let caller = self.env().caller();
            match self.buyer {
                Some(b) if b == caller => {}
                _ => return Err(EscrowError::NotBuyer),
            }
            if self.state != State::Funded {
                return Err(EscrowError::InvalidState)
            }
            self.transfer_to(self.seller, self.price)?;
            self.state = State::Closed;
            Ok(())
        }

        /// Buyer opens a dispute. This transitions the contract into `Disputed` and
        /// sets a dispute deadline (now + dispute_window_ms). Only the buyer can open.
        #[ink(message)]
        pub fn open_dispute(&mut self) -> Result<(), EscrowError> {
            let caller = self.env().caller();
            match self.buyer {
                Some(b) if b == caller => {}
                _ => return Err(EscrowError::NotBuyer),
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
            let caller = self.env().caller();
            if caller != self.arbiter {
                return Err(EscrowError::NotArbiter)
            }
            if self.state != State::Disputed {
                return Err(EscrowError::InvalidState)
            }
            // perform transfer according to resolution
            if in_favour_seller {
                self.transfer_to(self.seller, self.price)?;
            } else {
                let buyer = self.buyer.expect("buyer must exist in disputed state");
                self.transfer_to(buyer, self.price)?;
            }
            self.state = State::Closed;
            Ok(())
        }

        /// If the arbiter doesn't act before the deadline, anyone can call this.
        /// The default behaviour is to refund the buyer and close the contract.
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
            // refund buyer
            let buyer = self.buyer.expect("buyer must exist in disputed state");
            self.transfer_to(buyer, self.price)?;
            self.state = State::Closed;
            Ok(())
        }

        /// Helper to transfer balance from contract to `to`. Returns EscrowError if transfer fails.
        fn transfer_to(&mut self, to: AccountId, amount: Balance) -> Result<(), EscrowError> {
            match self.env().transfer(to, amount) {
                Ok(()) => Ok(()),
                Err(_e) => Err(EscrowError::TransferFailed),
            }
        }

        // --- getters ---

        #[ink(message)]
        pub fn get_seller(&self) -> AccountId {
            self.seller
        }

        #[ink(message)]
        pub fn get_arbiter(&self) -> AccountId {
            self.arbiter
        }

        #[ink(message)]
        pub fn get_buyer(&self) -> Option<AccountId> {
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

    /// Errors returned by the contract.
    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum EscrowError {
        InvalidState,
        IncorrectAmount,
        NotBuyer,
        NotArbiter,
        TransferFailed,
        NoDeadline,
        NotTimedOut,
    }

    // Unit tests for the contract's logic.
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
            // create contract where bob is seller, charlie is arbiter, price = 100
            let mut contract = DescrowContract::new(accounts.bob, accounts.charlie, 100, 10_000, Some(String::from("order-1")));

            // buyer (alice) stakes 100
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            test::set_value_transferred::<ink::env::DefaultEnvironment>(100);
            assert_eq!(contract.stake(), Ok(()));
            assert_eq!(contract.get_state(), State::Funded);

            // buyer confirms delivery
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            // set contract's balance so transfer can succeed in test env
            test::set_account_balance::<ink::env::DefaultEnvironment>(contract.env().account_id(), 100);
            assert_eq!(contract.confirm_delivery(), Ok(()));
            assert_eq!(contract.get_state(), State::Closed);
        }

        #[ink::test]
        fn dispute_resolved_in_sellers_favour() {
            let accounts = default_accounts();
            let mut contract = DescrowContract::new(accounts.bob, accounts.charlie, 50, 10_000, None);

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
            let mut contract = DescrowContract::new(accounts.bob, accounts.charlie, 75, 1_000, None);

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
