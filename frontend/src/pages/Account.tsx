import { Shield, Bell, Wallet, CreditCard, Lock } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const Account = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences and security
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Account Type</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {user?.userType}
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {user?.userType}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="order-updates">Order Updates</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive notifications about your orders
                  </div>
                </div>
                <Switch id="order-updates" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="escrow-updates">Escrow Updates</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified about escrow status changes
                  </div>
                </div>
                <Switch id="escrow-updates" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="marketing">Marketing Emails</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive promotional offers and updates
                  </div>
                </div>
                <Switch id="marketing" />
              </div>
            </CardContent>
          </Card>

          {/* Payment & Wallet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Payment & Wallet
              </CardTitle>
              <CardDescription>
                Manage your payment methods and wallet connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connected Wallets</Label>
                  <div className="text-sm text-muted-foreground">
                    Manage your blockchain wallet connections
                  </div>
                </div>
                <Badge variant="outline">
                  <CreditCard className="h-3 w-3 mr-1" />
                  0 Connected
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-connect">Auto-connect Wallet</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically connect wallet on page load
                  </div>
                </div>
                <Switch id="auto-connect" />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </div>
                </div>
                <Switch id="2fa" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-timeout">Auto Logout</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically logout after inactivity
                  </div>
                </div>
                <Switch id="session-timeout" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Account;

