# Web3 Market - Frontend Features

## Overview
This is a decentralized marketplace frontend showcasing the escrow payment flow with blockchain integration.

## Demo Credentials

### Buyer Account
- **Email:** buyer@test.com
- **Password:** buyer123
- **Features:** Browse products, place orders, track escrow payments, confirm goods receipt

### Seller Account
- **Email:** seller@test.com
- **Password:** seller123
- **Features:** View sales dashboard, track escrow releases, manage payments

## Key Features

### 1. Landing Page (Products)
- Product catalog with Web3 hardware and software
- Shopping cart functionality
- Navbar with cart and sign-in options

### 2. Authentication System
- Mocked sign-in with buyer/seller user types
- Persistent login (localStorage)
- Protected routes for authenticated users
- Role-based access (buyer vs seller)

### 3. Multi-Wallet Support
- **Polkadot.js Extension** - Original implementation
- **MetaMask** - For Moonbeam chain compatibility
- Wallet selection modal
- Connection status display
- Balance tracking (MetaMask)

### 4. Buyer Flow
After signing in as a buyer:
- **Navbar Updates:**
  - Connect Wallet button (shows connection status when connected)
  - Profile dropdown with:
    - Orders
    - Edit Profile
    - Account Settings
    - Sign Out

- **Orders Page:**
  - List of all orders with status
  - Escrow status badges
  - Order tracking information
  - Click to view details

- **Order Details Page:**
  - Product scanning functionality (IoT integration placeholder)
  - Escrow money tracking with progress bar
  - Blockchain explorer link (Moonbeam/Moonscan)
  - Transaction hash display
  - Confirm goods button (releases funds from escrow)
  - Real-time escrow status updates

### 5. Seller Flow
After signing in as a seller:
- **Redirects to Seller Dashboard**
- **Dashboard Features:**
  - Wallet connection (required for receiving payments)
  - Sales statistics:
    - Total sales
    - Amount in escrow
    - Completed orders
    - Active orders
  - Recent orders list with escrow tracking
  - Payment status for each order
  - Progress indicators for escrow releases

### 6. Profile Management
- Edit profile page
- Update name and email
- View account type
- Avatar with initials

### 7. Account Settings
- Notification preferences
- Wallet management
- Security settings
- Two-factor authentication toggle

## Escrow Flow Demonstration

### Order States
1. **Pending** - Order placed, awaiting payment
2. **Funded** - Payment received in escrow
3. **In Transit** - Goods shipped to buyer
4. **Delivered** - Goods delivered, awaiting confirmation
5. **Completed** - Buyer confirmed, funds released to seller
6. **Disputed** - Issue raised (future feature)

### Escrow Tracking Features
- Real-time progress bar (0-100%)
- Escrow contract address display
- Transaction hash with explorer link
- Amount locked in escrow
- Release date (for completed orders)
- Tracking number integration

## Technical Implementation

### State Management
- **AuthContext** - User authentication and profile
- **WalletContext** - Multi-wallet connection management
- **CartContext** - Shopping cart state

### Mock Data
- 8 sample products
- 3 sample orders with different escrow states
- Demo user accounts

### Routing
- Public routes: `/`, `/signin`, `/checkout`
- Protected routes: `/orders`, `/orders/:id`, `/profile`, `/account`
- Seller-only routes: `/seller-dashboard`

### Wallet Integration
- Polkadot.js extension support
- MetaMask integration (Moonbeam-ready)
- Wallet selection modal
- Connection persistence
- Balance display

## Future Backend Integration Points

All frontend functionality is ready for backend integration:

1. **Authentication API**
   - Replace mock login with real API calls
   - JWT token management
   - User registration

2. **Smart Contract Integration**
   - Deploy escrow contracts
   - Real transaction signing
   - Blockchain event listeners

3. **Order Management API**
   - Create orders from cart
   - Update order status
   - Track shipments

4. **Escrow Contract Calls**
   - Fund escrow on purchase
   - Release funds on confirmation
   - Handle disputes

5. **IoT Scanning**
   - Product verification
   - QR code scanning
   - NFC integration

## Running the Application

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and sign in with demo credentials to explore the features.

## Notes

- All blockchain transactions are currently mocked
- Backend integration coming soon
- Smart contract deployment pending
- Moonbeam chain migration in progress
- MetaMask is the recommended wallet for production

