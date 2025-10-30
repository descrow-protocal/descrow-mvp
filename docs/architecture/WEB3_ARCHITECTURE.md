# Web3 Architecture - Descrow MVP Smart Contract

## Overview

The Web3 layer consists of an ink! smart contract deployed on Polkadot that manages escrow functionality, order states, and dispute resolution. It serves as the trustless foundation for DOT payments while providing oracle integration for M-Pesa transactions.

## Core Responsibilities

1. **Escrow Management**: Hold and release DOT funds based on delivery confirmation
2. **Order Lifecycle**: Track order states from creation to completion
3. **Oracle Integration**: Accept off-chain payment confirmations from authorized backend
4. **Dispute Resolution**: Handle disputes with evidence submission and admin resolution
5. **Event Emission**: Provide real-time updates through blockchain events
6. **Access Control**: Enforce role-based permissions for different operations

## Technology Stack

- **Language**: Rust with ink! framework
- **Blockchain**: Polkadot (Substrate-based)
- **Testing**: ink! unit tests + integration tests
- **Deployment**: Polkadot.js Apps or custom deployment scripts
- **Development**: Local Substrate node or public testnet

## Smart Contract Architecture

### Data Structure Design

**Order Management**: The contract defines comprehensive order structures that track all relevant information including buyer and seller addresses, payment amounts, payment modes (DOT or M-Pesa), current status, and timestamps for each lifecycle event. Orders also store IPFS content identifiers for product metadata and tracking information.

**Payment Mode Handling**: The contract supports two distinct payment modes - DOT payments that are handled entirely on-chain with funds held in escrow, and M-Pesa payments that are recorded on-chain but managed off-chain by the oracle system.

**Dispute System**: Dispute structures track the initiating party, reason for dispute, evidence content identifiers, creation timestamps, and resolution details. The system supports multiple evidence submissions and maintains a complete audit trail.

**Status State Machine**: Orders progress through defined states (Created, Funded, Shipped, Delivered, Completed) with specific transition rules. Disputed orders enter a separate resolution flow that can result in refunds, fund release, or partial settlements.

### Core Contract Functions

**Order Creation**: The create_order function establishes new escrow agreements between buyers and sellers. It validates input parameters, assigns unique order IDs, stores order details with IPFS metadata references, and emits creation events for off-chain monitoring.

**DOT Payment Processing**: The fund_order_dot function handles trustless DOT payments by accepting transferred funds, validating payment amounts against order requirements, storing funds in contract escrow, and updating order status to funded. This function ensures atomic payment and status updates.

**Oracle Payment Recording**: The record_offchain_payment function allows authorized oracle accounts to record M-Pesa payments on-chain. It validates oracle permissions, updates order status to funded, and emits events for backend processing while maintaining audit trails.

**Shipping Management**: The mark_shipped function enables sellers to update order status when items are dispatched. It validates seller permissions, stores tracking information on IPFS, updates timestamps, and notifies buyers through event emission.

**Delivery Confirmation**: The confirm_delivery function allows buyers to acknowledge receipt of goods. For DOT orders, this triggers automatic fund release to sellers minus platform fees. For M-Pesa orders, it signals the backend to initiate B2C payouts.

**Dispute Handling**: The raise_dispute function enables buyers or sellers to initiate dispute resolution. It validates party permissions, stores dispute reasons and evidence, changes order status to disputed, and alerts administrators through events.

**Administrative Resolution**: The resolve_dispute function provides administrators with tools to settle disputes through full refunds, complete fund release, or partial settlements. It executes financial transfers for DOT orders and emits resolution events for M-Pesa processing.

### Access Control System

**Owner Privileges**: The contract owner (deployer) has administrative privileges including oracle account management, platform fee adjustments, contract pause functionality, and emergency fund withdrawal capabilities when the contract is paused.

**Oracle Authorization**: Designated oracle accounts can record off-chain payments and complete M-Pesa orders after B2C payouts. Oracle functions are restricted to prevent unauthorized payment recording and maintain system integrity.

**User Permissions**: Buyers and sellers have specific permissions for their respective roles - buyers can fund orders and confirm delivery, sellers can mark orders as shipped, and both parties can raise disputes on their orders.

**Emergency Controls**: The contract includes pause functionality that halts all operations except administrative functions. This provides emergency stop capabilities for security incidents or system maintenance.

### Event System

**Order Lifecycle Events**: The contract emits comprehensive events for each order state change including OrderCreated, OrderFunded, OrderShipped, OrderDelivered, and OrderCompleted. Each event includes relevant order details and participant information.

**Payment Events**: Separate events track payment confirmations for both DOT and M-Pesa transactions. These events include payment amounts, transaction references, and payment modes for complete audit trails.

**Dispute Events**: DisputeRaised and DisputeResolved events provide real-time updates about dispute status changes. These events include dispute reasons, evidence references, and resolution details for transparency.

**Administrative Events**: Events track administrative actions like oracle changes, fee adjustments, and contract pause/unpause operations. This ensures all administrative activities are publicly auditable.

### Security Features

**Reentrancy Protection**: The contract implements reentrancy guards by updating state before making external calls and using Substrate's built-in transfer mechanisms rather than low-level calls.

**Integer Overflow Protection**: Rust's built-in overflow protection prevents arithmetic errors, while careful balance calculations ensure accurate fee computations and fund transfers.

**Access Control Validation**: All functions include appropriate permission checks to ensure only authorized parties can perform specific actions. Failed authorization attempts are rejected with clear error messages.

**Input Validation**: Function parameters are validated for correctness including non-zero amounts, valid account addresses, and proper order states before processing operations.

### Fund Management

**Escrow Operations**: For DOT payments, the contract holds funds in escrow until delivery confirmation or dispute resolution. Funds are mapped to specific orders and buyers to prevent unauthorized access.

**Fee Calculation**: Platform fees are calculated as basis points (e.g., 250 = 2.5%) of the order amount. Fee calculations are performed during fund release to ensure accurate deductions.

**Transfer Mechanisms**: The contract uses Substrate's native transfer function for fund movements, providing built-in security and error handling. Failed transfers result in transaction reversion to maintain consistency.

**Emergency Withdrawal**: When the contract is paused, the owner can withdraw funds for security purposes. This function is restricted to emergency situations and requires contract pause status.

## Testing Strategy

### Unit Testing

**Function Testing**: Each contract function is thoroughly tested with valid inputs, invalid inputs, and edge cases. Tests verify correct state changes, event emissions, and error handling for all scenarios.

**Access Control Testing**: Permission systems are tested to ensure unauthorized users cannot perform restricted actions. Tests verify that only appropriate roles can execute specific functions.

**State Transition Testing**: Order state machine transitions are tested to ensure orders can only move through valid state changes and that invalid transitions are properly rejected.

### Integration Testing

**End-to-End Flow Testing**: Complete order workflows are tested from creation through completion including both DOT and M-Pesa payment flows. Tests verify that all components work together correctly.

**Event Emission Testing**: Tests verify that appropriate events are emitted for each action and that event data includes all necessary information for off-chain processing.

**Error Scenario Testing**: Various error conditions are tested including insufficient funds, invalid permissions, and contract pause states to ensure robust error handling.

### Security Testing

**Attack Vector Testing**: The contract is tested against common attack vectors including reentrancy attacks, integer overflow attempts, and unauthorized access attempts.

**Fund Security Testing**: Tests verify that funds can only be accessed by authorized parties and that escrow mechanisms prevent premature fund release.

**Oracle Security Testing**: Oracle functions are tested to ensure only authorized oracle accounts can record payments and that oracle actions are properly validated.

## Deployment Strategy

### Network Deployment

**Local Development**: The contract is first deployed and tested on local Substrate nodes for rapid development and testing cycles. Local deployment allows for quick iteration and debugging.

**Testnet Deployment**: Before mainnet deployment, the contract is thoroughly tested on Polkadot testnets to validate functionality in a realistic blockchain environment with actual network conditions.

**Mainnet Deployment**: Production deployment follows careful planning with proper oracle account setup, fee configuration, and administrative controls. Deployment scripts ensure consistent configuration across environments.

### Configuration Management

**Oracle Setup**: Oracle accounts are configured during deployment with appropriate permissions for M-Pesa payment recording. Multiple oracle accounts can be configured for redundancy.

**Fee Configuration**: Platform fees are set during deployment and can be adjusted by the contract owner. Fee changes are logged through events for transparency.

**Administrative Controls**: Owner accounts are configured with appropriate security measures including multi-signature requirements for sensitive operations in production environments.

### Upgrade Strategy

**Contract Versioning**: New contract versions are deployed as separate contracts with migration tools to transfer state and funds from previous versions when necessary.

**State Migration**: For major upgrades, migration functions help transfer order data and escrow funds from old contracts to new versions while maintaining user access.

**Backward Compatibility**: API compatibility is maintained where possible to minimize disruption to frontend and backend integrations during upgrades.

## Monitoring and Maintenance

### Event Monitoring

**Real-time Tracking**: Contract events are monitored in real-time to detect unusual activity, failed transactions, or potential security issues. Monitoring systems alert administrators to important events.

**Performance Metrics**: Transaction costs, execution times, and success rates are tracked to identify optimization opportunities and ensure efficient contract operation.

### Security Monitoring

**Access Pattern Analysis**: Administrative function calls and oracle activities are monitored for unusual patterns that might indicate security issues or unauthorized access attempts.

**Fund Flow Tracking**: Large fund movements and unusual transaction patterns are monitored to detect potential issues with escrow operations or dispute resolutions.

### Maintenance Operations

**Regular Audits**: Contract code and deployment configurations are regularly audited for security vulnerabilities and optimization opportunities.

**Emergency Procedures**: Clear procedures are established for emergency situations including contract pausing, fund recovery, and communication with users during incidents.

This Web3 architecture provides a robust, secure, and feature-complete smart contract foundation for the Descrow MVP, handling both trustless DOT transactions and oracle-based M-Pesa integration while maintaining strong security guarantees and comprehensive audit trails.


# Web3 Architecture - Descrow MVP Smart Contract

## Overview

The Web3 layer consists of an ink! smart contract deployed on Polkadot that manages escrow functionality, order states, and dispute resolution. It serves as the trustless foundation for DOT payments while providing oracle integration for M-Pesa transactions.

## Core Responsibilities

1. **Escrow Management**: Hold and release DOT funds based on delivery confirmation
2. **Order Lifecycle**: Track order states from creation to completion
3. **Oracle Integration**: Accept off-chain payment confirmations from authorized backend
4. **Dispute Resolution**: Handle disputes with evidence submission and admin resolution
5. **Event Emission**: Provide real-time updates through blockchain events
6. **Access Control**: Enforce role-based permissions for different operations

## Technology Stack

- **Language**: Rust with ink! framework
- **Blockchain**: Polkadot (Substrate-based)
- **Testing**: ink! unit tests + integration tests
- **Deployment**: Polkadot.js Apps or custom deployment scripts
- **Development**: Local Substrate node or public testnet

## Project Structure

```
web3/
├── lib.rs                    # Main contract implementation
├── types.rs                  # Custom type definitions
├── errors.rs                 # Error definitions
├── events.rs                 # Event definitions
├── storage.rs                # Storage structures
├── modifiers.rs              # Access control modifiers
├── tests/
│   ├── unit_tests.rs         # Unit tests
│   ├── integration_tests.rs  # Integration tests
│   └── mock_data.rs          # Test data
├── Cargo.toml               # Dependencies and metadata
├── .gitignore
└── README.md
```

## Smart Contract Architecture

### Core Data Structures

```rust
use ink::prelude::vec::Vec;
use ink::storage::Mapping;
use scale::{Decode, Encode};

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum OrderStatus {
    Created,
    Funded,
    Shipped,
    Delivered,
    Completed,
    Disputed,
    Resolved,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum PaymentMode {
    Dot,
    Mpesa,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum DisputeResolution {
    RefundBuyer,
    ReleaseFunds,
    PartialRefund(Balance),
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct Order {
    pub id: u32,
    pub buyer: AccountId,
    pub seller: AccountId,
    pub amount: Balance,
    pub payment_mode: PaymentMode,
    pub status: OrderStatus,
    pub metadata_cid: String,
    pub tracking_cid: Option<String>,
    pub evidence_cids: Vec<String>,
    pub created_at: Timestamp,
    pub funded_at: Option<Timestamp>,
    pub shipped_at: Option<Timestamp>,
    pub delivered_at: Option<Timestamp>,
    pub disputed_at: Option<Timestamp>,
    pub resolved_at: Option<Timestamp>,
}

#[derive(Debug, Clone, PartialEq, Eq, Encode, Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct Dispute {
    pub order_id: u32,
    pub initiator: AccountId,
    pub reason: String,
    pub evidence_cids: Vec<String>,
    pub created_at: Timestamp,
    pub resolved_at: Option<Timestamp>,
    pub resolution: Option<DisputeResolution>,
}
```

### Main Contract Implementation

```rust
#[ink::contract]
mod descrow_contract {
    use super::*;
    use ink::storage::Mapping;
    
    #[ink(storage)]
    pub struct DescrowContract {
        /// Contract owner (admin)
        owner: AccountId,
        /// Oracle account for off-chain payment recording
        oracle: AccountId,
        /// Next order ID
        next_order_id: u32,
        /// Orders mapping
        orders: Mapping<u32, Order>,
        /// Disputes mapping
        disputes: Mapping<u32, Dispute>,
        /// User balances (for DOT escrow)
        escrow_balances: Mapping<(u32, AccountId), Balance>,
        /// Paused state for emergency stops
        paused: bool,
        /// Platform fee percentage (basis points, e.g., 250 = 2.5%)
        platform_fee: u16,
    }

    /// Events emitted by the contract
    #[ink(event)]
    pub struct OrderCreated {
        #[ink(topic)]
        order_id: u32,
        #[ink(topic)]
        buyer: AccountId,
        #[ink(topic)]
        seller: AccountId,
        amount: Balance,
        payment_mode: PaymentMode,
        metadata_cid: String,
    }

    #[ink(event)]
    pub struct OrderFunded {
        #[ink(topic)]
        order_id: u32,
        #[ink(topic)]
        buyer: AccountId,
        amount: Balance,
        payment_mode: PaymentMode,
        tx_hash: Option<String>,
    }

    #[ink(event)]
    pub struct OrderShipped {
        #[ink(topic)]
        order_id: u32,
        #[ink(topic)]
        seller: AccountId,
        tracking_cid: String,
    }

    #[ink(event)]
    pub struct OrderDelivered {
        #[ink(topic)]
        order_id: u32,
        #[ink(topic)]
        buyer: AccountId,
    }

    #[ink(event)]
    pub struct OrderCompleted {
        #[ink(topic)]
        order_id: u32,
        #[ink(topic)]
        seller: AccountId,
        amount_released: Balance,
        platform_fee: Balance,
    }

    #[ink(event)]
    pub struct DisputeRaised {
        #[ink(topic)]
        order_id: u32,
        #[ink(topic)]
        initiator: AccountId,
        reason: String,
        evidence_cid: String,
    }

    #[ink(event)]
    pub struct DisputeResolved {
        #[ink(topic)]
        order_id: u32,
        resolution: DisputeResolution,
        resolved_by: AccountId,
    }

    /// Custom errors
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ContractError {
        /// Order not found
        OrderNotFound,
        /// Unauthorized access
        Unauthorized,
        /// Invalid order status for operation
        InvalidOrderStatus,
        /// Insufficient balance
        InsufficientBalance,
        /// Invalid payment amount
        InvalidAmount,
        /// Contract is paused
        ContractPaused,
        /// Invalid dispute resolution
        InvalidResolution,
        /// Order already disputed
        OrderAlreadyDisputed,
        /// Dispute not found
        DisputeNotFound,
        /// Transfer failed
        TransferFailed,
    }

    type Result<T> = core::result::Result<T, ContractError>;

    impl DescrowContract {
        /// Constructor
        #[ink(constructor)]
        pub fn new(oracle: AccountId) -> Self {
            let caller = Self::env().caller();
            Self {
                owner: caller,
                oracle,
                next_order_id: 1,
                orders: Mapping::default(),
                disputes: Mapping::default(),
                escrow_balances: Mapping::default(),
                paused: false,
                platform_fee: 250, // 2.5%
            }
        }

        /// Create a new order
        #[ink(message)]
        pub fn create_order(
            &mut self,
            seller: AccountId,
            amount: Balance,
            payment_mode: PaymentMode,
            metadata_cid: String,
        ) -> Result<u32> {
            self.ensure_not_paused()?;
            
            let caller = self.env().caller();
            let order_id = self.next_order_id;
            let timestamp = self.env().block_timestamp();

            let order = Order {
                id: order_id,
                buyer: caller,
                seller,
                amount,
                payment_mode,
                status: OrderStatus::Created,
                metadata_cid: metadata_cid.clone(),
                tracking_cid: None,
                evidence_cids: Vec::new(),
                created_at: timestamp,
                funded_at: None,
                shipped_at: None,
                delivered_at: None,
                disputed_at: None,
                resolved_at: None,
            };

            self.orders.insert(order_id, &order);
            self.next_order_id += 1;

            self.env().emit_event(OrderCreated {
                order_id,
                buyer: caller,
                seller,
                amount,
                payment_mode,
                metadata_cid,
            });

            Ok(order_id)
        }

        /// Fund order with DOT (trustless path)
        #[ink(message, payable)]
        pub fn fund_order_dot(&mut self, order_id: u32) -> Result<()> {
            self.ensure_not_paused()?;
            
            let caller = self.env().caller();
            let transferred_value = self.env().transferred_value();
            
            let mut order = self.get_order_mut(order_id)?;
            
            // Validate order state and ownership
            if order.status != OrderStatus::Created {
                return Err(ContractError::InvalidOrderStatus);
            }
            if order.buyer != caller {
                return Err(ContractError::Unauthorized);
            }
            if order.payment_mode != PaymentMode::Dot {
                return Err(ContractError::InvalidAmount);
            }
            if transferred_value != order.amount {
                return Err(ContractError::InvalidAmount);
            }

            // Update order status and store escrow
            order.status = OrderStatus::Funded;
            order.funded_at = Some(self.env().block_timestamp());
            
            self.escrow_balances.insert((order_id, caller), &transferred_value);
            self.orders.insert(order_id, &order);

            self.env().emit_event(OrderFunded {
                order_id,
                buyer: caller,
                amount: transferred_value,
                payment_mode: PaymentMode::Dot,
                tx_hash: None,
            });

            Ok(())
        }

        /// Record off-chain payment (M-Pesa oracle path)
        #[ink(message)]
        pub fn record_offchain_payment(
            &mut self,
            order_id: u32,
            tx_hash: String,
        ) -> Result<()> {
            self.ensure_not_paused()?;
            self.ensure_oracle()?;
            
            let mut order = self.get_order_mut(order_id)?;
            
            if order.status != OrderStatus::Created {
                return Err(ContractError::InvalidOrderStatus);
            }
            if order.payment_mode != PaymentMode::Mpesa {
                return Err(ContractError::InvalidAmount);
            }

            order.status = OrderStatus::Funded;
            order.funded_at = Some(self.env().block_timestamp());
            self.orders.insert(order_id, &order);

            self.env().emit_event(OrderFunded {
                order_id,
                buyer: order.buyer,
                amount: order.amount,
                payment_mode: PaymentMode::Mpesa,
                tx_hash: Some(tx_hash),
            });

            Ok(())
        }

        /// Mark order as shipped
        #[ink(message)]
        pub fn mark_shipped(&mut self, order_id: u32, tracking_cid: String) -> Result<()> {
            self.ensure_not_paused()?;
            
            let caller = self.env().caller();
            let mut order = self.get_order_mut(order_id)?;
            
            if order.status != OrderStatus::Funded {
                return Err(ContractError::InvalidOrderStatus);
            }
            if order.seller != caller {
                return Err(ContractError::Unauthorized);
            }

            order.status = OrderStatus::Shipped;
            order.tracking_cid = Some(tracking_cid.clone());
            order.shipped_at = Some(self.env().block_timestamp());
            self.orders.insert(order_id, &order);

            self.env().emit_event(OrderShipped {
                order_id,
                seller: caller,
                tracking_cid,
            });

            Ok(())
        }

        /// Confirm delivery (buyer)
        #[ink(message)]
        pub fn confirm_delivery(&mut self, order_id: u32) -> Result<()> {
            self.ensure_not_paused()?;
            
            let caller = self.env().caller();
            let mut order = self.get_order_mut(order_id)?;
            
            if order.status != OrderStatus::Shipped {
                return Err(ContractError::InvalidOrderStatus);
            }
            if order.buyer != caller {
                return Err(ContractError::Unauthorized);
            }

            order.status = OrderStatus::Delivered;
            order.delivered_at = Some(self.env().block_timestamp());
            self.orders.insert(order_id, &order);

            self.env().emit_event(OrderDelivered {
                order_id,
                buyer: caller,
            });

            // Auto-complete for DOT orders
            if order.payment_mode == PaymentMode::Dot {
                self.complete_order_internal(order_id)?;
            }

            Ok(())
        }

        /// Complete order and release funds
        #[ink(message)]
        pub fn complete_order(&mut self, order_id: u32) -> Result<()> {
            self.ensure_not_paused()?;
            
            let order = self.get_order(order_id)?;
            
            // Only oracle can complete M-Pesa orders (after B2C payout)
            if order.payment_mode == PaymentMode::Mpesa {
                self.ensure_oracle()?;
            }
            
            self.complete_order_internal(order_id)
        }

        /// Internal order completion logic
        fn complete_order_internal(&mut self, order_id: u32) -> Result<()> {
            let mut order = self.get_order_mut(order_id)?;
            
            if order.status != OrderStatus::Delivered {
                return Err(ContractError::InvalidOrderStatus);
            }

            order.status = OrderStatus::Completed;
            self.orders.insert(order_id, &order);

            // Release DOT funds if applicable
            if order.payment_mode == PaymentMode::Dot {
                let escrow_amount = self.escrow_balances.get((order_id, order.buyer)).unwrap_or(0);
                if escrow_amount > 0 {
                    let platform_fee = (escrow_amount * self.platform_fee as u128) / 10000;
                    let seller_amount = escrow_amount - platform_fee;

                    // Transfer to seller
                    if self.env().transfer(order.seller, seller_amount).is_err() {
                        return Err(ContractError::TransferFailed);
                    }

                    // Transfer platform fee to owner
                    if platform_fee > 0 {
                        if self.env().transfer(self.owner, platform_fee).is_err() {
                            return Err(ContractError::TransferFailed);
                        }
                    }

                    self.escrow_balances.remove((order_id, order.buyer));

                    self.env().emit_event(OrderCompleted {
                        order_id,
                        seller: order.seller,
                        amount_released: seller_amount,
                        platform_fee,
                    });
                }
            } else {
                // For M-Pesa, just emit completion event
                self.env().emit_event(OrderCompleted {
                    order_id,
                    seller: order.seller,
                    amount_released: order.amount,
                    platform_fee: 0,
                });
            }

            Ok(())
        }

        /// Raise a dispute
        #[ink(message)]
        pub fn raise_dispute(
            &mut self,
            order_id: u32,
            reason: String,
            evidence_cid: String,
        ) -> Result<()> {
            self.ensure_not_paused()?;
            
            let caller = self.env().caller();
            let mut order = self.get_order_mut(order_id)?;
            
            // Only buyer or seller can raise disputes
            if order.buyer != caller && order.seller != caller {
                return Err(ContractError::Unauthorized);
            }
            
            // Can only dispute funded, shipped, or delivered orders
            match order.status {
                OrderStatus::Funded | OrderStatus::Shipped | OrderStatus::Delivered => {},
                _ => return Err(ContractError::InvalidOrderStatus),
            }

            // Check if already disputed
            if self.disputes.contains(order_id) {
                return Err(ContractError::OrderAlreadyDisputed);
            }

            let timestamp = self.env().block_timestamp();
            let dispute = Dispute {
                order_id,
                initiator: caller,
                reason: reason.clone(),
                evidence_cids: vec![evidence_cid.clone()],
                created_at: timestamp,
                resolved_at: None,
                resolution: None,
            };

            order.status = OrderStatus::Disputed;
            order.disputed_at = Some(timestamp);
            order.evidence_cids.push(evidence_cid.clone());

            self.orders.insert(order_id, &order);
            self.disputes.insert(order_id, &dispute);

            self.env().emit_event(DisputeRaised {
                order_id,
                initiator: caller,
                reason,
                evidence_cid,
            });

            Ok(())
        }

        /// Add evidence to existing dispute
        #[ink(message)]
        pub fn add_evidence(&mut self, order_id: u32, evidence_cid: String) -> Result<()> {
            self.ensure_not_paused()?;
            
            let caller = self.env().caller();
            let mut order = self.get_order_mut(order_id)?;
            let mut dispute = self.disputes.get(order_id).ok_or(ContractError::DisputeNotFound)?;
            
            // Only involved parties can add evidence
            if order.buyer != caller && order.seller != caller {
                return Err(ContractError::Unauthorized);
            }

            order.evidence_cids.push(evidence_cid.clone());
            dispute.evidence_cids.push(evidence_cid);

            self.orders.insert(order_id, &order);
            self.disputes.insert(order_id, &dispute);

            Ok(())
        }

        /// Resolve dispute (admin only)
        #[ink(message)]
        pub fn resolve_dispute(
            &mut self,
            order_id: u32,
            resolution: DisputeResolution,
        ) -> Result<()> {
            self.ensure_not_paused()?;
            self.ensure_owner()?;
            
            let mut order = self.get_order_mut(order_id)?;
            let mut dispute = self.disputes.get(order_id).ok_or(ContractError::DisputeNotFound)?;
            
            if order.status != OrderStatus::Disputed {
                return Err(ContractError::InvalidOrderStatus);
            }

            let timestamp = self.env().block_timestamp();
            order.status = OrderStatus::Resolved;
            order.resolved_at = Some(timestamp);
            dispute.resolved_at = Some(timestamp);
            dispute.resolution = Some(resolution.clone());

            // Execute resolution for DOT orders
            if order.payment_mode == PaymentMode::Dot {
                let escrow_amount = self.escrow_balances.get((order_id, order.buyer)).unwrap_or(0);
                if escrow_amount > 0 {
                    match resolution {
                        DisputeResolution::RefundBuyer => {
                            if self.env().transfer(order.buyer, escrow_amount).is_err() {
                                return Err(ContractError::TransferFailed);
                            }
                        },
                        DisputeResolution::ReleaseFunds => {
                            let platform_fee = (escrow_amount * self.platform_fee as u128) / 10000;
                            let seller_amount = escrow_amount - platform_fee;
                            
                            if self.env().transfer(order.seller, seller_amount).is_err() {
                                return Err(ContractError::TransferFailed);
                            }
                            if platform_fee > 0 {
                                if self.env().transfer(self.owner, platform_fee).is_err() {
                                    return Err(ContractError::TransferFailed);
                                }
                            }
                        },
                        DisputeResolution::PartialRefund(refund_amount) => {
                            if refund_amount > escrow_amount {
                                return Err(ContractError::InvalidResolution);
                            }
                            let seller_amount = escrow_amount - refund_amount;
                            
                            if self.env().transfer(order.buyer, refund_amount).is_err() {
                                return Err(ContractError::TransferFailed);
                            }
                            if seller_amount > 0 {
                                if self.env().transfer(order.seller, seller_amount).is_err() {
                                    return Err(ContractError::TransferFailed);
                                }
                            }
                        },
                    }
                    self.escrow_balances.remove((order_id, order.buyer));
                }
            }

            self.orders.insert(order_id, &order);
            self.disputes.insert(order_id, &dispute);

            self.env().emit_event(DisputeResolved {
                order_id,
                resolution,
                resolved_by: self.env().caller(),
            });

            Ok(())
        }

        /// Get order details
        #[ink(message)]
        pub fn get_order(&self, order_id: u32) -> Result<Order> {
            self.orders.get(order_id).ok_or(ContractError::OrderNotFound)
        }

        /// Get dispute details
        #[ink(message)]
        pub fn get_dispute(&self, order_id: u32) -> Result<Dispute> {
            self.disputes.get(order_id).ok_or(ContractError::DisputeNotFound)
        }

        /// Get orders by buyer
        #[ink(message)]
        pub fn get_orders_by_buyer(&self, buyer: AccountId, limit: u32, offset: u32) -> Vec<Order> {
            let mut orders = Vec::new();
            let mut count = 0;
            let mut skipped = 0;
            
            for i in 1..self.next_order_id {
                if let Some(order) = self.orders.get(i) {
                    if order.buyer == buyer {
                        if skipped < offset {
                            skipped += 1;
                            continue;
                        }
                        if count >= limit {
                            break;
                        }
                        orders.push(order);
                        count += 1;
                    }
                }
            }
            orders
        }

        /// Get orders by seller
        #[ink(message)]
        pub fn get_orders_by_seller(&self, seller: AccountId, limit: u32, offset: u32) -> Vec<Order> {
            let mut orders = Vec::new();
            let mut count = 0;
            let mut skipped = 0;
            
            for i in 1..self.next_order_id {
                if let Some(order) = self.orders.get(i) {
                    if order.seller == seller {
                        if skipped < offset {
                            skipped += 1;
                            continue;
                        }
                        if count >= limit {
                            break;
                        }
                        orders.push(order);
                        count += 1;
                    }
                }
            }
            orders
        }

        /// Admin functions
        #[ink(message)]
        pub fn set_oracle(&mut self, new_oracle: AccountId) -> Result<()> {
            self.ensure_owner()?;
            self.oracle = new_oracle;
            Ok(())
        }

        #[ink(message)]
        pub fn set_platform_fee(&mut self, new_fee: u16) -> Result<()> {
            self.ensure_owner()?;
            if new_fee > 1000 { // Max 10%
                return Err(ContractError::InvalidAmount);
            }
            self.platform_fee = new_fee;
            Ok(())
        }

        #[ink(message)]
        pub fn pause_contract(&mut self) -> Result<()> {
            self.ensure_owner()?;
            self.paused = true;
            Ok(())
        }

        #[ink(message)]
        pub fn unpause_contract(&mut self) -> Result<()> {
            self.ensure_owner()?;
            self.paused = false;
            Ok(())
        }

        /// Emergency withdrawal (owner only, when paused)
        #[ink(message)]
        pub fn emergency_withdraw(&mut self, amount: Balance) -> Result<()> {
            self.ensure_owner()?;
            if !self.paused {
                return Err(ContractError::Unauthorized);
            }
            
            if self.env().transfer(self.owner, amount).is_err() {
                return Err(ContractError::TransferFailed);
            }
            Ok(())
        }

        /// Helper functions
        fn get_order_mut(&mut self, order_id: u32) -> Result<Order> {
            self.orders.get(order_id).ok_or(ContractError::OrderNotFound)
        }

        fn ensure_owner(&self) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(ContractError::Unauthorized);
            }
            Ok(())
        }

        fn ensure_oracle(&self) -> Result<()> {
            if self.env().caller() != self.oracle {
                return Err(ContractError::Unauthorized);
            }
            Ok(())
        }

        fn ensure_not_paused(&self) -> Result<()> {
            if self.paused {
                return Err(ContractError::ContractPaused);
            }
            Ok(())
        }
    }
}
```

## Testing Strategy

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use ink::env::test;

    #[ink::test]
    fn test_create_order() {
        let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();
        let mut contract = DescrowContract::new(accounts.bob);
        
        let result = contract.create_order(
            accounts.charlie,
            1000,
            PaymentMode::Dot,
            "QmTest123".to_string(),
        );
        
        assert!(result.is_ok());
        let order_id = result.unwrap();
        assert_eq!(order_id, 1);
        
        let order = contract.get_order(order_id).unwrap();
        assert_eq!(order.buyer, accounts.alice);
        assert_eq!(order.seller, accounts.charlie);
        assert_eq!(order.amount, 1000);
        assert_eq!(order.status, OrderStatus::Created);
    }

    #[ink::test]
    fn test_fund_order_dot() {
        let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();
        let mut contract = DescrowContract::new(accounts.bob);
        
        // Create order
        let order_id = contract.create_order(
            accounts.charlie,
            1000,
            PaymentMode::Dot,
            "QmTest123".to_string(),
        ).unwrap();
        
        // Set transferred value
        test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
        
        // Fund order
        let result = contract.fund_order_dot(order_id);
        assert!(result.is_ok());
        
        let order = contract.get_order(order_id).unwrap();
        assert_eq!(order.status, OrderStatus::Funded);
        assert!(order.funded_at.is_some());
    }

    #[ink::test]
    fn test_complete_order_flow() {
        let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();
        let mut contract = DescrowContract::new(accounts.bob);
        
        // Create and fund order
        let order_id = contract.create_order(
            accounts.charlie,
            1000,
            PaymentMode::Dot,
            "QmTest123".to_string(),
        ).unwrap();
        
        test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
        contract.fund_order_dot(order_id).unwrap();
        
        // Switch to seller account
        test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
        
        // Mark shipped
        contract.mark_shipped(order_id, "QmTracking456".to_string()).unwrap();
        
        // Switch back to buyer
        test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
        
        // Confirm delivery
        contract.confirm_delivery(order_id).unwrap();
        
        let order = contract.get_order(order_id).unwrap();
        assert_eq!(order.status, OrderStatus::Completed);
    }

    #[ink::test]
    fn test_dispute_flow() {
        let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();
        let mut contract = DescrowContract::new(accounts.bob);
        
        // Create and fund order
        let order_id = contract.create_order(
            accounts.charlie,
            1000,
            PaymentMode::Dot,
            "QmTest123".to_string(),
        ).unwrap();
        
        test::set_value_transferred::<ink::env::DefaultEnvironment>(1000);
        contract.fund_order_dot(order_id).unwrap();
        
        // Raise dispute
        contract.raise_dispute(
            order_id,
            "Product not as described".to_string(),
            "QmEvidence789".to_string(),
        ).unwrap();
        
        let order = contract.get_order(order_id).unwrap();
        assert_eq!(order.status, OrderStatus::Disputed);
        
        let dispute = contract.get_dispute(order_id).unwrap();
        assert_eq!(dispute.initiator, accounts.alice);
        
        // Resolve dispute (as owner)
        test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice); // Owner
        contract.resolve_dispute(order_id, DisputeResolution::RefundBuyer).unwrap();
        
        let order = contract.get_order(order_id).unwrap();
        assert_eq!(order.status, OrderStatus::Resolved);
    }

    #[ink::test]
    fn test_unauthorized_access() {
        let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();
        let mut contract = DescrowContract::new(accounts.bob);
        
        let order_id = contract.create_order(
            accounts.charlie,
            1000,
            PaymentMode::Dot,
            "QmTest123".to_string(),
        ).unwrap();
        
        // Try to mark shipped as buyer (should fail)
        let result = contract.mark_shipped(order_id, "QmTracking456".to_string());
        assert_eq!(result, Err(ContractError::Unauthorized));
        
        // Try to confirm delivery as seller (should fail)
        test::set_caller::<ink::env::DefaultEnvironment>(accounts.charlie);
        let result = contract.confirm_delivery(order_id);
        assert_eq!(result, Err(ContractError::InvalidOrderStatus)); // Not funded yet
    }
}
```

### Integration Tests

```rust
#[cfg(all(test, feature = "e2e-tests"))]
mod e2e_tests {
    use super::*;
    use ink_e2e::build_message;

    type E2EResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;

    #[ink_e2e::test]
    async fn test_end_to_end_dot_flow(mut client: ink_e2e::Client<C, E>) -> E2EResult<()> {
        // Deploy contract
        let constructor = DescrowContractRef::new(alice_account_id());
        let contract_acc_id = client
            .instantiate("descrow_contract", &ink_e2e::alice(), constructor, 0, None)
            .await
            .expect("instantiate failed")
            .account_id;

        // Create order
        let create_order_msg = build_message::<DescrowContractRef>(contract_acc_id.clone())
            .call(|contract| contract.create_order(
                bob_account_id(),
                1_000_000_000_000, // 1 DOT
                PaymentMode::Dot,
                "QmProductMetadata123".to_string(),
            ));

        let create_result = client
            .call(&ink_e2e::alice(), create_order_msg, 0, None)
            .await
            .expect("create_order failed");

        let order_id = create_result.return_value().expect("Order creation failed");
        assert_eq!(order_id, 1);

        // Fund order
        let fund_order_msg = build_message::<DescrowContractRef>(contract_acc_id.clone())
            .call(|contract| contract.fund_order_dot(order_id));

        let fund_result = client
            .call(&ink_e2e::alice(), fund_order_msg, 1_000_000_000_000, None)
            .await
            .expect("fund_order_dot failed");

        assert!(fund_result.return_value().is_ok());

        // Verify order status
        let get_order_msg = build_message::<DescrowContractRef>(contract_acc_id.clone())
            .call(|contract| contract.get_order(order_id));

        let order_result = client
            .call_dry_run(&ink_e2e::alice(), &get_order_msg, 0, None)
            .await;

        let order = order_result.return_value().unwrap();
        assert_eq!(order.status, OrderStatus::Funded);

        Ok(())
    }
}
```

## Deployment Configuration

### Cargo.toml

```toml
[package]
name = "descrow_contract"
version = "0.1.0"
authors = ["Descrow Team"]
edition = "2021"

[dependencies]
ink = { version = "4.0", default-features = false }
scale = { package = "parity-scale-codec", version = "3", default-features = false, features = ["derive"] }
scale-info = { version = "2.3", default-features = false, features = ["derive"], optional = true }

[dev-dependencies]
ink_e2e = "4.0"

[lib]
name = "descrow_contract"
path = "lib.rs"
crate-type = ["cdylib"]

[features]
default = ["std"]
std = [
    "ink/std",
    "scale/std",
    "scale-info/std",
]
ink-as-dependency = []
e2e-tests = []
```

### Deployment Script

```bash
#!/bin/bash

# Build contract
echo "Building contract..."
cargo contract build --release

# Deploy to local node
echo "Deploying to local node..."
cargo contract instantiate \
    --constructor new \
    --args "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" \
    --suri //Alice \
    --salt $(date +%s) \
    --url ws://127.0.0.1:9944

# Deploy to testnet
echo "Deploying to testnet..."
cargo contract instantiate \
    --constructor new \
    --args "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" \
    --suri "//YourDeploymentSeed" \
    --salt $(date +%s) \
    --url wss://rococo-contracts-rpc.polkadot.io
```

## Security Considerations

### Access Control
- Owner-only functions for admin operations
- Oracle-only functions for off-chain payment recording
- Buyer/seller restrictions for order operations

### Reentrancy Protection
- State updates before external calls
- Use of `transfer` instead of `call` for fund transfers

### Integer Overflow Protection
- Rust's built-in overflow protection
- Careful balance calculations

### Emergency Controls
- Contract pause functionality
- Emergency withdrawal for owner when paused

This Web3 architecture provides a robust, secure, and feature-complete smart contract foundation for the Descrow MVP, handling both trustless DOT transactions and oracle-based M-Pesa integration.