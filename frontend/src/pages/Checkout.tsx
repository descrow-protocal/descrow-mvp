import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { usePolkadot } from '@/hooks/usePolkadot';
import { Navbar } from '@/components/Navbar';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { account, isConnecting, connectWallet, disconnectWallet, sendTransaction } = usePolkadot();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handlePayment = async () => {
    if (!account) {
      connectWallet();
      return;
    }

    setIsProcessing(true);
    const success = await sendTransaction(totalPrice);
    
    if (success) {
      setIsComplete(true);
      setTimeout(() => {
        clearCart();
        navigate('/');
      }, 3000);
    }
    
    setIsProcessing(false);
  };

  if (items.length === 0 && !isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <p className="mb-4 text-muted-foreground">Your cart is empty</p>
              <Button onClick={() => navigate('/')}>Continue Shopping</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
          <Card className="w-full max-w-md text-center border-success/50">
            <CardContent className="pt-6">
              <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success animate-fade-in" />
              <h2 className="mb-2 text-2xl font-bold">Payment Successful!</h2>
              <p className="mb-4 text-muted-foreground">
                Your order has been processed through escrow
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to home...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>{items.length} items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <div className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24 border-primary/20 bg-gradient-to-b from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Secure Payment via Escrow
                </CardTitle>
                <CardDescription>
                  Complete your purchase using Polkadot.js wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!account ? (
                  <>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <h3 className="mb-2 font-semibold">How it works:</h3>
                      <ol className="space-y-2 text-sm text-muted-foreground">
                        <li>1. Connect your Polkadot.js wallet</li>
                        <li>2. Funds are held in escrow smart contract</li>
                        <li>3. Seller ships your items</li>
                        <li>4. Confirm receipt to release payment</li>
                      </ol>
                    </div>
                    
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={connectWallet}
                      disabled={isConnecting}
                    >
                      <Wallet className="mr-2 h-5 w-5" />
                      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg border border-success/50 bg-success/10 p-4">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">Wallet Connected</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {account.meta.name || account.address}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {account.address}
                      </p>
                    </div>

                    <div className="rounded-lg bg-muted/50 p-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-muted-foreground">Escrow Fee</span>
                        <span className="font-semibold">$0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-lg font-bold text-primary">
                          ${totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 animate-glow"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Complete Payment'}
                    </Button>

                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={disconnectWallet}
                      disabled={isProcessing}
                    >
                      Disconnect Wallet
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
