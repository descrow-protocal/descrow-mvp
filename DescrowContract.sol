// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DescrowContract {
    enum State {
        Created,
        Funded,
        Disputed,
        Closed
    }

    address public buyer;
    address public seller;
    address public arbiter;
    uint256 public price;
    uint256 public disputeWindowMs;
    uint256 public disputeDeadline;
    State public state;

    error InvalidState();
    error IncorrectAmount();
    error NotBuyer();
    error NotArbiter();
    error NoDeadline();
    error NotTimedOut();
    error TransferFailed();
    error LessThanStakingAmount();

    constructor(address _seller, address _arbiter, uint256 _price, uint256 _disputeWindowMs) {
        seller = _seller;
        arbiter = _arbiter;
        price = _price;
        disputeWindowMs = _disputeWindowMs;
        state = State.Created;
    }

    function stake() external payable returns (string memory) {
        if (state != State.Created) revert InvalidState();
        if (price == 0) revert IncorrectAmount();
        if (msg.value < price) revert LessThanStakingAmount();

        buyer = msg.sender;
        state = State.Funded;

        return "Staked successfully!";
    }

    function confirmDelivery() external {
        if (msg.sender != buyer) revert NotBuyer();
        if (state != State.Funded) revert InvalidState();

        state = State.Closed;
        (bool success, ) = seller.call{value: price}("");
        if (!success) revert TransferFailed();
    }

    function openDispute() external {
        if (msg.sender != buyer) revert NotBuyer();
        if (state != State.Funded) revert InvalidState();

        disputeDeadline = block.timestamp + disputeWindowMs;
        state = State.Disputed;
    }

    function resolveDispute(bool inFavourSeller) external {
        if (msg.sender != arbiter) revert NotArbiter();
        if (state != State.Disputed) revert InvalidState();

        state = State.Closed;
        address recipient = inFavourSeller ? seller : buyer;
        (bool success, ) = recipient.call{value: price}("");
        if (!success) revert TransferFailed();
    }

    function claimTimeout() external {
        if (state != State.Disputed) revert InvalidState();
        if (disputeDeadline == 0) revert NoDeadline();
        if (block.timestamp < disputeDeadline) revert NotTimedOut();

        state = State.Closed;
        (bool success, ) = buyer.call{value: price}("");
        if (!success) revert TransferFailed();
    }
}
