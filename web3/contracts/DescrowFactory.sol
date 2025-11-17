// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DescrowContract.sol";

contract DescrowFactory {
    event OrderCreated(address indexed orderContract, address indexed seller, address indexed buyer, uint256 price);
    
    mapping(uint256 => address) public orders;
    uint256 public orderCount;
    
    function createOrder(address seller, uint256 price, uint256 disputeWindow) external payable returns (address) {
        require(msg.value >= price, "Insufficient payment");
        
        DescrowContract newOrder = new DescrowContract(seller, price, disputeWindow);
        address orderAddress = address(newOrder);
        
        // Fund the new contract
        newOrder.stake{value: msg.value}();
        
        orders[orderCount] = orderAddress;
        orderCount++;
        
        emit OrderCreated(orderAddress, seller, msg.sender, price);
        return orderAddress;
    }
    
    function getOrder(uint256 orderId) external view returns (address) {
        return orders[orderId];
    }
}