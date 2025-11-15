import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockOrders, getEscrowStatusColor, getEscrowStatusLabel, type EscrowStatus } from '@/lib/mockData';
import { format } from 'date-fns';

const getStatusIcon = (status: EscrowStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'funded':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'in_transit':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <Package className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'disputed':
      return <AlertCircle className="h-4 w-4" />;
  }
};

const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-muted-foreground">
            Track your orders and manage escrow payments
          </p>
        </div>

        {mockOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Button onClick={() => navigate('/')}>Browse Products</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                      <CardDescription>
                        Placed on {format(new Date(order.date), 'MMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getEscrowStatusColor(order.escrowStatus)} border-current`}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.escrowStatus)}
                        {getEscrowStatusLabel(order.escrowStatus)}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="flex gap-4">
                      {order.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-20 w-20 rounded-md object-cover"
                          />
                          {item.quantity > 1 && (
                            <Badge
                              variant="secondary"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
                            >
                              {item.quantity}
                            </Badge>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center text-sm text-muted-foreground">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Amount</div>
                        <div className="text-xl font-bold text-primary">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4" />
                        <span>Tracking: {order.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;

