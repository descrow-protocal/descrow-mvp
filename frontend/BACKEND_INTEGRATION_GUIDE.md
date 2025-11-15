# Backend Integration Guide

This guide shows where and how to integrate the backend API and smart contracts with the frontend.

## 🔐 Authentication Integration

### File: `frontend/src/contexts/AuthContext.tsx`

**Current Implementation (Mocked):**
```typescript
const login = useCallback(async (email: string, password: string, userType: UserType): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockUser = MOCK_USERS[email];
  // ... mock validation
});
```

**Replace with:**
```typescript
const login = useCallback(async (email: string, password: string, userType: UserType): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userType }),
    });

    if (!response.ok) {
      const error = await response.json();
      toast.error('Login failed', { description: error.message });
      return false;
    }

    const { user, token } = await response.json();
    
    // Store JWT token
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
    toast.success('Welcome back!', { description: `Logged in as ${user.name}` });
    
    return true;
  } catch (error) {
    toast.error('Connection error', { description: 'Failed to connect to server' });
    return false;
  }
});
```

**API Endpoints Needed:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (with JWT)

---

## 💰 Wallet & Smart Contract Integration

### File: `frontend/src/contexts/WalletContext.tsx`

**Current Implementation (Mocked):**
```typescript
const sendTransaction = useCallback(async (amount: number, recipient?: string): Promise<boolean> => {
  // Mock transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  toast.success('Transaction sent', { description: `Sent ${amount} to escrow` });
  return true;
}, [account, walletType]);
```

**Replace with Real Smart Contract Calls:**

#### For MetaMask (Moonbeam):
```typescript
const sendTransaction = useCallback(async (amount: number, recipient?: string): Promise<boolean> => {
  if (!account || walletType !== 'metamask') return false;

  try {
    const web3 = new Web3(window.ethereum);
    const escrowContract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);
    
    // Convert amount to Wei
    const amountWei = web3.utils.toWei(amount.toString(), 'ether');
    
    // Call escrow contract
    const tx = await escrowContract.methods.createEscrow(recipient).send({
      from: account.address,
      value: amountWei,
    });
    
    toast.success('Transaction sent', {
      description: `Tx: ${tx.transactionHash}`,
    });
    
    return true;
  } catch (error: any) {
    toast.error('Transaction failed', { description: error.message });
    return false;
  }
}, [account, walletType]);
```

#### For Polkadot.js:
```typescript
const sendTransaction = useCallback(async (amount: number, recipient?: string): Promise<boolean> => {
  if (!account || walletType !== 'polkadot') return false;

  try {
    const { web3FromAddress } = await import('@polkadot/extension-dapp');
    const injector = await web3FromAddress(account.address);
    
    // Create API instance
    const api = await ApiPromise.create({ provider: wsProvider });
    
    // Call escrow contract
    const tx = api.tx.contracts.call(
      ESCROW_CONTRACT_ADDRESS,
      0, // value
      GAS_LIMIT,
      null, // storageDepositLimit
      'createEscrow',
      recipient
    );
    
    await tx.signAndSend(account.address, { signer: injector.signer });
    
    toast.success('Transaction sent');
    return true;
  } catch (error: any) {
    toast.error('Transaction failed', { description: error.message });
    return false;
  }
}, [account, walletType]);
```

**Smart Contract Functions Needed:**
- `createEscrow(seller, amount)` - Create escrow on purchase
- `releaseEscrow(orderId)` - Release funds to seller
- `disputeEscrow(orderId)` - Raise dispute
- `getEscrowStatus(orderId)` - Get escrow state

---

## 📦 Orders Integration

### File: `frontend/src/pages/Orders.tsx`

**Current Implementation:**
```typescript
import { mockOrders } from '@/lib/mockData';
// ... uses mockOrders directly
```

**Replace with API Call:**
```typescript
import { useState, useEffect } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ... rest of component
};
```

**API Endpoints Needed:**
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/confirm` - Confirm goods received

---

## ✅ Confirm Goods Integration

### File: `frontend/src/pages/OrderDetails.tsx`

**Current Implementation:**
```typescript
const handleConfirmGoods = async () => {
  setIsConfirming(true);
  await new Promise(resolve => setTimeout(resolve, 2000));
  toast.success('Goods confirmed!');
  setIsConfirming(false);
};
```

**Replace with:**
```typescript
const handleConfirmGoods = async () => {
  setIsConfirming(true);
  
  try {
    // 1. Call smart contract to release escrow
    const web3 = new Web3(window.ethereum);
    const escrowContract = new web3.eth.Contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);
    
    const tx = await escrowContract.methods.releaseEscrow(order.id).send({
      from: account.address,
    });
    
    // 2. Update order status in backend
    const token = localStorage.getItem('authToken');
    await fetch(`/api/orders/${order.id}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionHash: tx.transactionHash,
      }),
    });
    
    toast.success('Goods confirmed!', {
      description: 'Funds released from escrow to seller',
    });
    
    // Refresh order data
    // ... refetch order
    
  } catch (error: any) {
    toast.error('Confirmation failed', { description: error.message });
  } finally {
    setIsConfirming(false);
  }
};
```

---

## 🔍 Product Scanning Integration

### File: `frontend/src/pages/OrderDetails.tsx`

**Current Implementation:**
```typescript
const handleScan = () => {
  setIsScanning(true);
  toast.info('Scanning product...');
  setTimeout(() => {
    setIsScanning(false);
    toast.success('Product scanned successfully');
  }, 2000);
};
```

**Replace with IoT/QR Scanner:**
```typescript
const handleScan = async () => {
  setIsScanning(true);
  
  try {
    // Option 1: QR Code Scanner
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Use QR scanner library to read code
    const qrCode = await scanQRCode(stream);
    
    // Option 2: NFC Reader
    // const nfcData = await readNFC();
    
    // Verify product authenticity
    const response = await fetch('/api/products/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item.productId,
        scanData: qrCode,
      }),
    });
    
    const { verified } = await response.json();
    
    if (verified) {
      toast.success('Product verified!', {
        description: 'Authentic product confirmed',
      });
    } else {
      toast.error('Verification failed', {
        description: 'Product could not be verified',
      });
    }
  } catch (error: any) {
    toast.error('Scan failed', { description: error.message });
  } finally {
    setIsScanning(false);
  }
};
```

---

## 📊 Seller Dashboard Integration

### File: `frontend/src/pages/SellerDashboard.tsx`

**Current Implementation:**
```typescript
const stats = {
  totalSales: 1109.95,
  pendingEscrow: 299.99,
  completedOrders: 2,
  activeOrders: 1,
};
const sellerOrders = mockOrders;
```

**Replace with:**
```typescript
const [stats, setStats] = useState(null);
const [sellerOrders, setSellerOrders] = useState([]);

useEffect(() => {
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('authToken');
    
    // Fetch statistics
    const statsResponse = await fetch('/api/seller/stats', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setStats(await statsResponse.json());
    
    // Fetch orders
    const ordersResponse = await fetch('/api/seller/orders', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setSellerOrders(await ordersResponse.json());
  };

  fetchDashboardData();
}, []);
```

**API Endpoints Needed:**
- `GET /api/seller/stats` - Get seller statistics
- `GET /api/seller/orders` - Get seller's orders
- `GET /api/seller/payments` - Get payment history

---

## 🌐 Environment Variables

Create `.env` file in frontend:

```env
VITE_API_URL=http://localhost:3000
VITE_ESCROW_CONTRACT_ADDRESS=0x...
VITE_MOONBEAM_RPC_URL=https://rpc.api.moonbeam.network
VITE_POLKADOT_WS_URL=wss://polkadot.api.onfinality.io/public-ws
VITE_BLOCKCHAIN_EXPLORER_URL=https://moonbeam.moonscan.io
```

---

## 📝 Summary of Integration Points

| Feature | File | Current | Replace With |
|---------|------|---------|--------------|
| Login | `AuthContext.tsx` | Mock users | POST /api/auth/login |
| Orders List | `Orders.tsx` | mockOrders | GET /api/orders |
| Order Details | `OrderDetails.tsx` | mockOrders | GET /api/orders/:id |
| Confirm Goods | `OrderDetails.tsx` | Mock delay | Smart contract + API |
| Scan Product | `OrderDetails.tsx` | Mock scan | QR/NFC + API verify |
| Seller Stats | `SellerDashboard.tsx` | Mock stats | GET /api/seller/stats |
| Wallet Tx | `WalletContext.tsx` | Mock tx | Web3/Polkadot.js calls |

---

## 🚀 Next Steps

1. Deploy escrow smart contract to Moonbeam testnet
2. Set up backend API with above endpoints
3. Replace mock data with API calls
4. Test wallet transactions on testnet
5. Implement real-time updates (WebSocket/polling)
6. Add error handling and retry logic
7. Implement transaction confirmation waiting
8. Add loading states for all async operations

