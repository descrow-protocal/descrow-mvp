import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Scan, ExternalLink, CheckCircle2, Wallet, Clock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getEscrowStatusColor, getEscrowStatusLabel } from '@/lib/mockData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { contract } from '@/lib/contract';
import { useWallet } from '@/contexts/WalletContext';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { account } = useWallet();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.orders.get(orderId!);
        setOrder(data);
      } catch (error: any) {
        toast.error('Failed to load order', { description: error.message });
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">Loading order...</div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Order not found</h3>
              <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const handleScan = () => {
    setIsScanning(true);
    toast.info('Scanning product...', {
      description: 'IoT scanning functionality will be integrated',
    });
    setTimeout(() => {
      setIsScanning(false);
      toast.success('Product scanned successfully');
    }, 2000);
  };

  const handleConfirmGoods = async () => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsConfirming(true);
    try {
      const txHash = await contract.confirmGoods(order.id, account.address);
      await api.orders.confirm(order.id, txHash);
      
      toast.success('Goods confirmed!', {
        description: 'Funds released from escrow to seller',
      });
      
      const updated = await api.orders.get(orderId!);
      setOrder(updated);
    } catch (error: any) {
      toast.error('Confirmation failed', { description: error.message });
    } finally {
      setIsConfirming(false);
    }
  };

  const escrowProgress = {
    pending: 0,
    funded: 25,
    in_transit: 50,
    delivered: 75,
    completed: 100,
    disputed: 50,
  }[order.escrowStatus];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Order Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{order.orderNumber}</CardTitle>
                    <CardDescription>
                      Placed on {format(new Date(order.date), 'MMMM dd, yyyy')}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${getEscrowStatusColor(order.escrowStatus)} border-current`}
                  >
                    {getEscrowStatusLabel(order.escrowStatus)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-lg border">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-20 w-20 rounded-md object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-lg font-bold text-primary mt-1">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleScan}
                          disabled={isScanning}
                        >
                          <Scan className="mr-2 h-4 w-4" />
                          {isScanning ? 'Scanning...' : 'Scan'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Escrow & Actions */}
          <div className="space-y-6">
            {/* Escrow Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Escrow Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{escrowProgress}%</span>
                  </div>
                  <Progress value={escrowProgress} className="h-2" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Escrow Address</span>
                  </div>
                  <code className="block text-xs bg-muted p-2 rounded break-all">
                    {order.escrowAddress}
                  </code>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount in Escrow</span>
                    <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-semibold ${getEscrowStatusColor(order.escrowStatus)}`}>
                      {getEscrowStatusLabel(order.escrowStatus)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transaction Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Transaction Hash</div>
                  <code className="block text-xs bg-muted p-2 rounded break-all">
                    {order.transactionHash}
                  </code>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    window.open(`https://moonbeam.moonscan.io/tx/${order.transactionHash}`, '_blank');
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </Button>

                {order.trackingNumber && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Tracking Number</div>
                    <div className="text-sm font-mono bg-muted p-2 rounded">
                      {order.trackingNumber}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {order.escrowStatus === 'delivered' && (
              <Card className="border-green-500/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Confirm Receipt
                  </CardTitle>
                  <CardDescription>
                    Confirm you received the goods to release funds from escrow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleConfirmGoods}
                    disabled={isConfirming}
                  >
                    {isConfirming ? 'Confirming...' : 'Confirm Goods Received'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {order.escrowStatus === 'completed' && order.escrowReleaseDate && (
              <Card className="border-gray-500/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      Completed on {format(new Date(order.escrowReleaseDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetails;

