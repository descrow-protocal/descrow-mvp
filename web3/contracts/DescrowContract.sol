// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DescrowContract {
    enum State { Created, Funded, InTransit, Delivered, Completed, Disputed }

    address public buyer;
    address public seller;
    uint256 public price;
    uint256 public disputeWindow;
    uint256 public disputeDeadline;
    State public state;
    string public trackingNumber;

    event Funded(address indexed buyer, uint256 amount);
    event Shipped(string trackingNumber);
    event Delivered();
    event GoodsConfirmed(address indexed buyer);
    event FundsReleased(address indexed seller, uint256 amount);
    event DisputeOpened(uint256 deadline);
    event DisputeResolved(address indexed winner, uint256 amount);

    error InvalidState();
    error NotBuyer();
    error NotSeller();
    error InsufficientAmount();
    error TransferFailed();
    error DisputeNotTimedOut();

    constructor(address _seller, uint256 _price, uint256 _disputeWindow) {
        seller = _seller;
        price = _price;
        disputeWindow = _disputeWindow;
        state = State.Created;
    }

    function stake() external payable {
        if (state != State.Created) revert InvalidState();
        if (msg.value < price) revert InsufficientAmount();

        buyer = msg.sender;
        state = State.Funded;
        emit Funded(buyer, msg.value);
    }

    function markShipped(string calldata _trackingNumber) external {
        if (msg.sender != seller) revert NotSeller();
        if (state != State.Funded) revert InvalidState();

        trackingNumber = _trackingNumber;
        state = State.InTransit;
        emit Shipped(_trackingNumber);
    }

    function markDelivered() external {
        if (msg.sender != seller) revert NotSeller();
        if (state != State.InTransit) revert InvalidState();

        state = State.Delivered;
        emit Delivered();
    }

    function confirmGoods() external {
        if (msg.sender != buyer) revert NotBuyer();
        if (state != State.Delivered) revert InvalidState();

        state = State.Completed;
        emit GoodsConfirmed(buyer);
        
        (bool success, ) = seller.call{value: address(this).balance}("");
        if (!success) revert TransferFailed();
        emit FundsReleased(seller, address(this).balance);
    }

    function openDispute() external {
        if (msg.sender != buyer) revert NotBuyer();
        if (state != State.Funded && state != State.InTransit && state != State.Delivered) revert InvalidState();

        disputeDeadline = block.timestamp + disputeWindow;
        state = State.Disputed;
        emit DisputeOpened(disputeDeadline);
    }

    function resolveDispute(bool refundBuyer) external {
        if (state != State.Disputed) revert InvalidState();
        if (block.timestamp < disputeDeadline) revert DisputeNotTimedOut();

        state = State.Completed;
        address recipient = refundBuyer ? buyer : seller;
        uint256 amount = address(this).balance;
        
        (bool success, ) = recipient.call{value: amount}("");
        if (!success) revert TransferFailed();
        emit DisputeResolved(recipient, amount);
    }

    function getState() external view returns (State) {
        return state;
    }
}
