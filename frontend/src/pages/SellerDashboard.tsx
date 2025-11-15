import { useState } from 'react';
import { Wallet, TrendingUp, Package, DollarSign, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WalletSelectionModal } from '@/components/WalletSelectionModal';
import { useWallet } from '@/contexts/WalletContext';
import { mockOrders } from '@/lib/mockData';

const SellerDashboard = () => {
  const { account, isConnected, disconnectWallet } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Mock seller statistics
  const stats = {
    totalSales: 1109.95,
    pendingEscrow: 299.99,
    completedOrders: 2,
    activeOrders: 1,
  };

  // Filter orders where this seller is involved (mock)
  const sellerOrders = mockOrders;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Seller Dashboard
            </h1>
            <span className="px-3 py-1 text-sm font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/30">
              TESTNET
            </span>
          </div>
          <p className="text-muted-foreground">
            Manage your sales and track escrow payments
          </p>
        </div>

        {/* Wallet Connection */}
        <Card className="mb-6 border-primary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect your wallet to receive payments from escrow
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/50 p-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Please connect your wallet to receive payments when buyers confirm receipt of goods.
                  </p>
                </div>
                <Button
                  onClick={() => setShowWalletModal(true)}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-success/50 bg-success/10 p-4">
                  <div className="flex items-center gap-2 text-success mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Wallet Connected</span>
                  </div>
                  <p className="text-sm text-muted-foreground break-all">
                    {account?.address}
                  </p>
                  {account?.balance && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Balance: {account.balance} ETH
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={disconnectWallet}
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${stats.pendingEscrow.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pending release</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">Orders completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Track payment status through escrow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sellerOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{order.orderNumber}</h4>
                      <Badge variant="outline">
                        {order.escrowStatus === 'completed' ? 'Paid' : 'In Escrow'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {order.items.map(item => item.productName).join(', ')}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress
                          value={order.escrowStatus === 'completed' ? 100 : 50}
                          className="h-2"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {order.escrowStatus === 'completed' ? 'Released' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-xl font-bold text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.escrowStatus === 'completed' ? 'Received' : 'In escrow'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <WalletSelectionModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />
    </div>
  );
};

export default SellerDashboard;

