// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DescrowContract
 * @dev Full escrow contract for buyer-seller transactions with an arbiter,
 * translated from the complete functional ink! source.
 */
contract DescrowContract {

    // --- Custom Errors (Solidity 0.8.4+) ---
    error InvalidState();
    error IncorrectAmount();
    error NotBuyer();
    error NotSeller(); // Added based on logic in commented functions
    error NotArbiter();
    error NoDeadline();
    error NotTimedOut();
    error TransferFailed();
    error LessThanStakingAmount();
    error BuyerNotSet(); // For safety checks

    // --- Types and Constants ---

    /// @dev Represents the current state of the escrow transaction.
    enum State {
        Created,
        Funded,
        Disputed,
        Closed
    }

    // --- State Variables ---

    // The address of the party holding the funds, set implicitly by the sender of 'new'.
    address public seller;
    
    // The designated third party for dispute resolution.
    address public arbiter;

    // The buyer's address. Use 'address(0)' to represent ink!'s Option<H160>::None (though stake sets it).
    address public buyer;
    
    // The amount required to stake. Use '0' to represent ink!'s Option<Balance>::None.
    uint256 public stakingAmount;
    
    // Time duration for the dispute window in seconds (Solidity uses seconds for timestamp).
    uint256 public disputeWindowSeconds; 

    // The deadline for the arbiter to resolve the dispute (timestamp in seconds).
    uint256 public disputeDeadline; // 0 represents Option<Timestamp>::None

    State public currentState;

    // --- Constructor ---

    /**
     * @dev Creates a new escrow instance.
     * @param _buyer The initial buyer (can be address(0)).
     * @param _stakingAmount The required staking amount (0 if Option::None).
     * @param _initialState The starting state.
     * @param _arbiter The designated arbiter address.
     * @param _disputeWindowSeconds The time limit for dispute resolution (in seconds).
     */
    constructor(
        address _buyer,
        uint256 _stakingAmount,
        State _initialState,
        address _arbiter, // Assumed missing arguments for full functionality
        uint256 _disputeWindowSeconds 
    ) {
        // The contract creator is implicitly the Seller (msg.sender)
        seller = msg.sender;
        arbiter = _arbiter;
        disputeWindowSeconds = _disputeWindowSeconds;

        // Initialize state variables
        buyer = _buyer;
        stakingAmount = _stakingAmount;
        currentState = _initialState;
        // disputeDeadline is 0 by default, representing Option::None
    }

    // --- Message Functions ---

    /**
     * @dev Buyer stakes the required amount. Payable function.
     */
    function stake() public payable {
        if (currentState != State.Created) {
            revert InvalidState();
        }

        uint256 requiredAmount = stakingAmount;
        if (requiredAmount == 0) {
            revert IncorrectAmount();
        }

        // Equivalent to ink! `transferred_value() < required_amount.into()`
        if (msg.value < requiredAmount) {
            revert LessThanStakingAmount();
        }

        // All good — set buyer and mark as funded
        // Equivalent to ink! `self.buyer = Some(self.env().caller())`
        buyer = msg.sender;
        currentState = State.Funded;
        // The ink! returns Ok(String), which is handled by a successful return here.
    }

    /**
     * @dev Buyer confirms delivery and releases funds to the seller.
     */
    function confirmDelivery() public {
        // Safety check to ensure buyer is set (not address(0))
        if (buyer == address(0)) { revert BuyerNotSet(); }

        // Equivalent to ink! `caller != self.buyer`
        if (msg.sender != buyer) {
            revert NotBuyer();
        }
        if (currentState != State.Funded) {
            revert InvalidState();
        }

        // Equivalent to ink! `self.transfer_to(seller, self.price)?`
        _transferTo(seller, stakingAmount);
        currentState = State.Closed;
    }

    /**
     * @dev Buyer opens a dispute. Only the buyer can call this.
     */
    function openDispute() public {
        if (buyer == address(0)) { revert BuyerNotSet(); }
        
        if (msg.sender != buyer) {
            revert NotBuyer();
        }
        if (currentState != State.Funded) {
            revert InvalidState();
        }

        // Equivalent to ink! `now + self.dispute_window_ms` 
        // using seconds for Solidity timestamp
        disputeDeadline = block.timestamp + disputeWindowSeconds; 
        currentState = State.Disputed;
    }

    /**
     * @dev Arbiter resolves the dispute. 
     * @param inFavourSeller true -> pay seller, else refund buyer.
     */
    function resolveDispute(bool inFavourSeller) public {
        if (msg.sender != arbiter) {
            revert NotArbiter();
        }
        if (currentState != State.Disputed) {
            revert InvalidState();
        }

        if (inFavourSeller) {
            // Pay Seller
            _transferTo(seller, stakingAmount);
        } else {
            // Refund Buyer
            if (buyer == address(0)) { revert BuyerNotSet(); }
            _transferTo(buyer, stakingAmount);
        }
        currentState = State.Closed;
    }

    /**
     * @dev If arbiter doesn't act before deadline, anyone can call to refund buyer.
     */
    function claimTimeout() public {
        if (currentState != State.Disputed) {
            revert InvalidState();
        }

        // Equivalent to ink! `self.dispute_deadline.ok_or(EscrowError::NoDeadline)?`
        if (disputeDeadline == 0) {
            revert NoDeadline();
        }

        // Equivalent to ink! `now < deadline`
        if (block.timestamp < disputeDeadline) {
            revert NotTimedOut();
        }

        // Refund buyer
        if (buyer == address(0)) { revert BuyerNotSet(); }
        _transferTo(buyer, stakingAmount);
        currentState = State.Closed;
    }

    // --- Internal Helper Function ---

    /**
     * @dev Helper to transfer balance from contract to `to`.
     * @param to The recipient address.
     * @param amount The amount to transfer.
     */
    function _transferTo(address to, uint256 amount) internal {
        // Solidity's low-level call handles the transfer of Ether (native currency).
        // It's crucial to check the success of the call.
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            revert TransferFailed();
        }
    }
}