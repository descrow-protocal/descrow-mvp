# Frontend Architecture - Descrow MVP

## Overview

The frontend is a React-based web application that provides an intuitive interface for buyers, sellers, and administrators to interact with the Descrow platform. It integrates with Polkadot wallets for DOT transactions and provides seamless M-Pesa payment flows optimized for mobile users in emerging markets.

## Core Responsibilities

1. **Wallet Integration**: Connect and interact with Polkadot browser extensions
2. **Payment Flows**: Handle both DOT and M-Pesa payment processes
3. **Order Management**: Create, track, and manage orders through their lifecycle
4. **Real-time Updates**: Display live order status changes via WebSocket
5. **Evidence Management**: Upload and display dispute evidence from IPFS
6. **Responsive Design**: Mobile-first approach for emerging market users

## Technology Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Headless UI
- **Blockchain**: Polkadot.js API + Extension
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library + Cypress

## Application Architecture

### Component Structure

The frontend follows a hierarchical component structure with clear separation of concerns:

**UI Components**: Base components like buttons, modals, inputs, and loading spinners that provide consistent styling and behavior across the application. These components are reusable and follow design system principles.

**Layout Components**: Header, sidebar, and footer components that provide consistent navigation and branding. The header includes wallet connection status, user account information, and main navigation links.

**Feature Components**: Specialized components for wallet integration, order management, and product display. These components handle specific business logic and user interactions related to their respective domains.

**Page Components**: Top-level components that represent different application screens like home, product listings, checkout, and dashboards. Each page component orchestrates multiple feature components to create complete user experiences.

### State Management Architecture

**Redux Store Structure**: The application uses Redux Toolkit for predictable state management with separate slices for authentication, wallet connection, orders, products, and notifications. Each slice manages its own state and provides actions for state updates.

**RTK Query Integration**: API calls are managed through RTK Query which provides automatic caching, background refetching, and optimistic updates. This reduces boilerplate code and provides excellent developer experience for data fetching.

**Local State Management**: Component-level state is managed using React hooks for UI-specific state like form inputs, modal visibility, and loading states that don't need to be shared across components.

## Wallet Integration

### Polkadot Extension Connection

**Wallet Detection**: The application automatically detects available Polkadot wallet extensions in the browser and presents connection options to users. It supports popular wallets like Polkadot.js extension, Talisman, and SubWallet.

**Account Management**: Once connected, users can select from multiple accounts within their wallet. The application displays account balances, manages account switching, and maintains connection state across browser sessions.

**Transaction Signing**: For DOT payments, the application prepares transaction data and requests signatures from the connected wallet. It handles transaction status updates and provides user feedback throughout the signing process.

### Security Considerations

**Wallet Permissions**: The application requests minimal permissions from wallet extensions and clearly communicates what actions require wallet interaction. Users maintain full control over their private keys and transaction approvals.

**Connection State Management**: Wallet connection state is persisted securely and automatically restored on page refresh. The application handles wallet disconnection gracefully and prompts users to reconnect when necessary.

## Payment Flow Implementation

### DOT Payment Process

**Transaction Preparation**: When users select DOT payment, the application calculates the exact amount including any fees and prepares the smart contract call. It validates that users have sufficient balance before proceeding.

**Smart Contract Interaction**: The application directly calls the smart contract's fund_order_dot function with the appropriate amount. It monitors transaction status from submission through block inclusion and finalization.

**Status Updates**: Real-time transaction status is displayed to users showing pending, in-block, and finalized states. The application provides clear feedback about transaction progress and handles potential failures gracefully.

### M-Pesa Payment Process

**Payment Initiation**: For M-Pesa payments, the application collects the user's phone number and initiates an STK push request through the backend API. It validates phone number format and provides clear instructions to users.

**STK Push Monitoring**: After initiating the STK push, the application displays a modal with payment instructions and monitors the payment status through polling or WebSocket updates. Users see real-time feedback about their payment attempt.

**Payment Confirmation**: Once M-Pesa payment is confirmed, the application updates the order status and notifies the user of successful payment. It handles payment failures with appropriate error messages and retry options.

## Real-time Updates

### WebSocket Integration

**Connection Management**: The application establishes WebSocket connections to receive real-time updates about order status changes, payment confirmations, and system notifications. Connections are automatically restored if dropped.

**Event Handling**: Different types of real-time events are handled appropriately - order updates refresh the order display, payment confirmations show success messages, and dispute notifications alert relevant users.

**Optimistic Updates**: The application implements optimistic updates for user actions, immediately updating the UI while confirming changes with the backend. This provides responsive user experience while maintaining data consistency.

### Notification System

**In-App Notifications**: Users receive toast notifications for important events like payment confirmations, order status changes, and system alerts. Notifications are categorized by type and importance level.

**Push Notifications**: For mobile users, the application supports push notifications to alert users about important order updates even when the app is not active. Users can control notification preferences.

## Mobile-First Design

### Responsive Layout

**Mobile Optimization**: The application is designed mobile-first with touch-friendly interfaces, appropriate font sizes, and optimized layouts for small screens. Navigation is simplified for mobile users with bottom navigation bars and swipe gestures.

**Progressive Web App Features**: The application includes PWA capabilities like offline functionality, app-like installation, and background sync. This provides native app-like experience on mobile devices.

**Touch Interactions**: All interactive elements are sized appropriately for touch input with adequate spacing to prevent accidental taps. Gestures like swipe-to-refresh and pull-to-load are implemented where appropriate.

### Performance Optimization

**Code Splitting**: The application uses dynamic imports and lazy loading to split code into smaller chunks. This reduces initial bundle size and improves loading times, especially important for users on slower mobile connections.

**Image Optimization**: Product images and other media are optimized for different screen sizes and connection speeds. The application uses responsive images and lazy loading to minimize data usage.

**Caching Strategy**: Static assets are cached aggressively while dynamic content uses appropriate cache headers. Service workers provide offline functionality and background updates for improved user experience.

## Order Management Interface

### Order Creation Flow

**Product Selection**: Users browse products with filtering and search capabilities. Product cards display essential information like price, seller rating, and availability status. Detailed product pages show comprehensive information and seller details.

**Checkout Process**: The checkout flow guides users through delivery address entry, payment method selection, and order confirmation. The interface clearly displays order totals, fees, and estimated delivery times.

**Payment Method Selection**: Users can choose between DOT and M-Pesa payments with clear explanations of each option. The interface shows current exchange rates and any applicable fees for each payment method.

### Order Tracking Interface

**Status Timeline**: Orders are displayed with visual timelines showing progress from creation through completion. Each status change includes timestamps and relevant details like tracking numbers or dispute information.

**Action Buttons**: Context-appropriate actions are available at each order stage - buyers can confirm delivery or raise disputes, while sellers can mark items as shipped and upload tracking information.

**Communication Tools**: The interface provides messaging capabilities between buyers and sellers for order-related communication. All messages are timestamped and stored for dispute resolution purposes.

## Dispute Resolution Interface

### Evidence Management

**File Upload System**: Users can upload evidence files like photos, documents, and videos to support their dispute claims. The system validates file types and sizes while providing progress feedback during uploads.

**Evidence Display**: Uploaded evidence is displayed in an organized manner with thumbnails for images and appropriate icons for other file types. Users can view full-size images and download documents as needed.

**Evidence Timeline**: All evidence submissions are timestamized and attributed to the submitting party. This creates a clear timeline of dispute-related communications and evidence.

### Admin Dashboard

**Dispute Queue**: Administrators see a prioritized list of pending disputes with relevant information like order value, dispute reason, and time since creation. Disputes can be filtered and sorted by various criteria.

**Evidence Review**: The admin interface provides comprehensive views of all dispute evidence with tools for viewing images, documents, and order history. Administrators can add notes and communicate with involved parties.

**Resolution Tools**: Administrators have tools to resolve disputes with options for full refunds, partial refunds, or releasing funds to sellers. All resolution actions are logged with reasoning for audit purposes.

## Testing Strategy

### Component Testing

**Unit Tests**: Individual components are tested in isolation using React Testing Library to verify correct rendering, user interactions, and state changes. Tests focus on component behavior rather than implementation details.

**Integration Tests**: Related components are tested together to ensure proper communication and data flow. These tests verify that complex user workflows function correctly across multiple components.

### End-to-End Testing

**User Journey Tests**: Complete user workflows are tested using Cypress to simulate real user interactions from product browsing through order completion. These tests verify that all system components work together correctly.

**Payment Flow Testing**: Both DOT and M-Pesa payment flows are thoroughly tested with mock wallet connections and payment services. Tests cover successful payments, failures, and edge cases.

**Cross-Browser Testing**: The application is tested across different browsers and devices to ensure consistent functionality and appearance. Mobile-specific features are tested on actual mobile devices.

## Performance Monitoring

### User Experience Metrics

**Loading Performance**: The application monitors page load times, time to interactive, and other Core Web Vitals metrics. Performance data is collected to identify optimization opportunities.

**Error Tracking**: JavaScript errors and failed API calls are tracked and reported for debugging. Error boundaries prevent application crashes and provide graceful error handling.

**User Analytics**: User behavior is tracked to understand how users interact with the application. This data helps identify usability issues and optimization opportunities.

### Optimization Strategies

**Bundle Optimization**: The build process optimizes JavaScript bundles through tree shaking, minification, and compression. Unused code is eliminated to reduce bundle sizes.

**Asset Optimization**: Images and other assets are optimized for web delivery with appropriate formats and compression. Critical assets are preloaded while non-critical assets are lazy loaded.

**Runtime Performance**: The application uses React best practices like memoization and efficient re-rendering to maintain smooth user interactions even with complex state updates.

This frontend architecture provides a comprehensive, user-friendly interface that seamlessly integrates blockchain and traditional payment systems while maintaining excellent performance and usability across all devices and network conditions.


# Frontend Architecture - Descrow MVP

## Overview

The frontend is a React-based web application that provides an intuitive interface for buyers, sellers, and administrators to interact with the Descrow platform. It integrates with Polkadot wallets for DOT transactions and provides seamless M-Pesa payment flows.

## Core Responsibilities

1. **Wallet Integration**: Connect and interact with Polkadot browser extensions
2. **Payment Flows**: Handle both DOT and M-Pesa payment processes
3. **Order Management**: Create, track, and manage orders through their lifecycle
4. **Real-time Updates**: Display live order status changes via WebSocket
5. **Evidence Management**: Upload and display dispute evidence from IPFS
6. **Responsive Design**: Mobile-first approach for emerging market users

## Technology Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Headless UI
- **Blockchain**: Polkadot.js API + Extension
- **Real-time**: Socket.io Client
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library + Cypress

## Project Structure

```
frontend/
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── wallet/          # Wallet components
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── AccountSelector.tsx
│   │   │   └── BalanceDisplay.tsx
│   │   ├── orders/          # Order components
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderDetails.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   └── PaymentSelector.tsx
│   │   └── products/        # Product components
│   │       ├── ProductCard.tsx
│   │       ├── ProductGrid.tsx
│   │       └── ProductForm.tsx
│   ├── pages/               # Page components
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Checkout.tsx
│   │   ├── Orders.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── Profile.tsx
│   │   ├── SellerDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useContract.ts
│   │   ├── useSocket.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── store/               # Redux store
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── walletSlice.ts
│   │   │   ├── ordersSlice.ts
│   │   │   └── productsSlice.ts
│   │   └── api/
│   │       ├── baseApi.ts
│   │       ├── authApi.ts
│   │       ├── ordersApi.ts
│   │       └── productsApi.ts
│   ├── services/            # External service integrations
│   │   ├── polkadot.service.ts
│   │   ├── ipfs.service.ts
│   │   ├── socket.service.ts
│   │   └── notification.service.ts
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── wallet.types.ts
│   │   ├── order.types.ts
│   │   └── product.types.ts
│   ├── styles/              # Global styles
│   │   ├── globals.css
│   │   └── components.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/                   # Test files
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── e2e/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Core Components

### 1. Wallet Integration

```typescript
// useWallet hook
interface WalletState {
  isConnected: boolean;
  accounts: InjectedAccount[];
  selectedAccount: InjectedAccount | null;
  balance: string;
  isLoading: boolean;
  error: string | null;
}

const useWallet = () => {
  const [state, setState] = useState<WalletState>(initialState);
  
  const connectWallet = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const extensions = await web3Enable('Descrow MVP');
      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found');
      }
      
      const accounts = await web3Accounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        accounts,
        selectedAccount: accounts[0],
        isLoading: false
      }));
      
      await updateBalance(accounts[0].address);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };
  
  return { ...state, connectWallet, selectAccount, updateBalance };
};
```

### 2. Payment Components

```typescript
// PaymentSelector component
interface PaymentSelectorProps {
  onPaymentMethodSelect: (method: 'dot' | 'mpesa') => void;
  amount: number;
  disabled?: boolean;
}

const PaymentSelector: React.FC<PaymentSelectorProps> = ({
  onPaymentMethodSelect,
  amount,
  disabled
}) => {
  const { balance } = useWallet();
  const [selectedMethod, setSelectedMethod] = useState<'dot' | 'mpesa'>('dot');
  
  const handleMethodChange = (method: 'dot' | 'mpesa') => {
    setSelectedMethod(method);
    onPaymentMethodSelect(method);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Payment Method</h3>
      
      {/* DOT Payment Option */}
      <div className={`border rounded-lg p-4 cursor-pointer ${
        selectedMethod === 'dot' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`} onClick={() => handleMethodChange('dot')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              checked={selectedMethod === 'dot'}
              onChange={() => handleMethodChange('dot')}
              className="text-blue-600"
            />
            <div>
              <p className="font-medium">Pay with DOT</p>
              <p className="text-sm text-gray-600">Fully trustless blockchain payment</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">{amount} DOT</p>
            <p className="text-sm text-gray-600">Balance: {balance} DOT</p>
          </div>
        </div>
      </div>
      
      {/* M-Pesa Payment Option */}
      <div className={`border rounded-lg p-4 cursor-pointer ${
        selectedMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-gray-200'
      }`} onClick={() => handleMethodChange('mpesa')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              checked={selectedMethod === 'mpesa'}
              onChange={() => handleMethodChange('mpesa')}
              className="text-green-600"
            />
            <div>
              <p className="font-medium">Pay with M-Pesa</p>
              <p className="text-sm text-gray-600">Mobile money payment</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold">KES {(amount * 1500).toLocaleString()}</p>
            <p className="text-sm text-gray-600">~1 DOT = 1,500 KES</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3. Order Management

```typescript
// OrderTimeline component
interface OrderTimelineProps {
  order: Order;
  userRole: 'buyer' | 'seller' | 'admin';
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order, userRole }) => {
  const steps = [
    { key: 'created', label: 'Order Created', icon: ShoppingCartIcon },
    { key: 'funded', label: 'Payment Confirmed', icon: CreditCardIcon },
    { key: 'shipped', label: 'Order Shipped', icon: TruckIcon },
    { key: 'delivered', label: 'Delivered', icon: CheckCircleIcon },
    { key: 'completed', label: 'Completed', icon: StarIcon }
  ];
  
  const getStepStatus = (stepKey: string) => {
    const statusOrder = ['created', 'funded', 'shipped', 'delivered', 'completed'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (order.status === 'disputed') {
      return stepIndex <= currentIndex ? 'completed' : 'pending';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };
  
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => {
          const status = getStepStatus(step.key);
          return (
            <li key={step.key}>
              <div className="relative pb-8">
                {stepIdx !== steps.length - 1 && (
                  <span
                    className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                      status === 'completed' ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      status === 'completed' ? 'bg-green-600' :
                      status === 'current' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      <step.icon className="h-5 w-5 text-white" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p className={`text-sm ${
                        status === 'completed' ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                      {order.timestamps?.[step.key] && (
                        <time>{formatDate(order.timestamps[step.key])}</time>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
```

## State Management

### Redux Store Structure

```typescript
// Store configuration
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    wallet: walletSlice.reducer,
    orders: ordersSlice.reducer,
    products: productsSlice.reducer,
    notifications: notificationsSlice.reducer,
    api: baseApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(baseApi.middleware)
});

// Auth slice
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    loginFailure: (state) => {
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    }
  }
});
```

### RTK Query API

```typescript
// Base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Order', 'Product', 'User'],
  endpoints: () => ({})
});

// Orders API
export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], void>({
      query: () => '/orders',
      providesTags: ['Order']
    }),
    getOrder: builder.query<Order, number>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }]
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order
      }),
      invalidatesTags: ['Order']
    }),
    payWithMpesa: builder.mutation<MpesaResponse, { orderId: number; phoneNumber: string }>({
      query: ({ orderId, phoneNumber }) => ({
        url: `/orders/${orderId}/pay/mpesa`,
        method: 'POST',
        body: { phoneNumber }
      }),
      invalidatesTags: (result, error, { orderId }) => [{ type: 'Order', id: orderId }]
    })
  })
});
```

## Real-time Updates

### Socket Integration

```typescript
// Socket service
class SocketService {
  private socket: Socket | null = null;
  
  connect(token: string) {
    this.socket = io(process.env.REACT_APP_WS_URL!, {
      auth: { token }
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    this.socket.on('orderUpdate', (data: OrderUpdateEvent) => {
      store.dispatch(ordersApi.util.updateQueryData('getOrder', data.orderId, (draft) => {
        Object.assign(draft, data.updates);
      }));
      
      // Show notification
      store.dispatch(addNotification({
        type: 'info',
        title: 'Order Updated',
        message: `Order #${data.orderId} status changed to ${data.updates.status}`
      }));
    });
    
    this.socket.on('paymentConfirmed', (data: PaymentConfirmedEvent) => {
      store.dispatch(ordersApi.util.updateQueryData('getOrder', data.orderId, (draft) => {
        draft.status = 'funded';
        draft.mpesa_tx_ref = data.transactionRef;
      }));
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  joinOrderRoom(orderId: number) {
    this.socket?.emit('joinOrder', orderId);
  }
  
  leaveOrderRoom(orderId: number) {
    this.socket?.emit('leaveOrder', orderId);
  }
}

// useSocket hook
const useSocket = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const socketRef = useRef<SocketService>(new SocketService());
  
  useEffect(() => {
    if (token) {
      socketRef.current.connect(token);
    }
    
    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);
  
  return socketRef.current;
};
```

## Mobile-First Design

### Responsive Components

```typescript
// Mobile-optimized product grid
const ProductGrid: React.FC<{ products: Product[] }> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

// Touch-friendly order actions
const OrderActions: React.FC<{ order: Order; userRole: string }> = ({ order, userRole }) => {
  const actions = getAvailableActions(order, userRole);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-pb">
      <div className="flex space-x-3">
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={action.handler}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-center ${action.className}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Progressive Web App Features

```typescript
// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Push notification handling
const usePushNotifications = () => {
  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };
  
  const subscribeToPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
    });
    
    // Send subscription to backend
    await api.post('/notifications/subscribe', subscription);
  };
  
  return { requestPermission, subscribeToPush };
};
```

## Error Handling

### Error Boundaries

```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
              <p className="mt-2 text-sm text-gray-500">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

## Testing Strategy

### Component Testing

```typescript
// ProductCard component test
describe('ProductCard', () => {
  const mockProduct: Product = {
    id: 1,
    title: 'Test Product',
    price_dot: '10.5',
    images_cid: 'QmTest123',
    seller: { id: 1, account_id: '5GrwvaEF...' }
  };
  
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('10.5 DOT')).toBeInTheDocument();
  });
  
  it('handles buy button click', async () => {
    const user = userEvent.setup();
    render(<ProductCard product={mockProduct} />);
    
    const buyButton = screen.getByRole('button', { name: /buy now/i });
    await user.click(buyButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(`/products/${mockProduct.id}`);
  });
});
```

### E2E Testing

```typescript
// Cypress E2E test
describe('Order Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.mockWallet();
    cy.login();
  });
  
  it('should complete DOT payment flow', () => {
    // Browse products
    cy.get('[data-testid="product-card"]').first().click();
    
    // Select product and proceed to checkout
    cy.get('[data-testid="buy-button"]').click();
    cy.get('[data-testid="payment-dot"]').click();
    
    // Connect wallet and confirm payment
    cy.get('[data-testid="connect-wallet"]').click();
    cy.get('[data-testid="confirm-payment"]').click();
    
    // Verify order creation
    cy.url().should('include', '/orders/');
    cy.get('[data-testid="order-status"]').should('contain', 'Funded');
  });
  
  it('should complete M-Pesa payment flow', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="buy-button"]').click();
    
    // Select M-Pesa payment
    cy.get('[data-testid="payment-mpesa"]').click();
    cy.get('[data-testid="phone-input"]').type('254712345678');
    cy.get('[data-testid="confirm-payment"]').click();
    
    // Mock STK push response
    cy.intercept('POST', '/api/orders/*/pay/mpesa', {
      statusCode: 200,
      body: { checkoutRequestId: 'ws_CO_123456789' }
    });
    
    // Verify STK push initiated
    cy.get('[data-testid="stk-push-modal"]').should('be.visible');
    cy.get('[data-testid="stk-instructions"]').should('contain', 'Check your phone');
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy loading for routes
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const SellerDashboard = lazy(() => import('../pages/SellerDashboard'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));

// Route configuration with suspense
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route
      path="/products/:id"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ProductDetail />
        </Suspense>
      }
    />
    <Route
      path="/seller"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <SellerDashboard />
        </Suspense>
      }
    />
  </Routes>
);
```

### Image Optimization

```typescript
// Optimized image component
const OptimizedImage: React.FC<{
  cid: string;
  alt: string;
  className?: string;
}> = ({ cid, alt, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const imageUrl = `${process.env.REACT_APP_IPFS_GATEWAY}/${cid}`;
  
  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover rounded ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded">
          <PhotoIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};
```

## Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'polkadot-node-polyfills',
      config(config) {
        config.define = {
          ...config.define,
          global: 'globalThis'
        };
        config.resolve = {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            buffer: 'buffer',
            process: 'process/browser',
            util: 'util'
          }
        };
      }
    }
  ],
  optimizeDeps: {
    include: ['buffer', 'process']
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          global: ['node-globals-polyfill/global'],
          process: ['node-globals-polyfill/process'],
          Buffer: ['buffer', 'Buffer']
        })
      ]
    }
  }
});
```

This frontend architecture provides a comprehensive, mobile-first React application that seamlessly integrates with both blockchain and traditional payment systems while maintaining excellent user experience and performance.