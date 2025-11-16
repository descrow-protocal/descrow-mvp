import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, User, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, type UserType } from '@/contexts/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [userType, setUserType] = useState<UserType>('buyer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password, userType);
    
    if (success) {
      // Navigate based on user type
      if (userType === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate(from);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Web3 Market
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your account type and sign in</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(v) => setUserType(v as UserType)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="buyer" className="gap-2">
                  <User className="h-4 w-4" />
                  Buyer
                </TabsTrigger>
                <TabsTrigger value="seller" className="gap-2">
                  <Store className="h-4 w-4" />
                  Seller
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-accent"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <TabsContent value="buyer" className="mt-6">
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-semibold mb-2">Demo Buyer Account:</p>
                  <p className="text-muted-foreground">Email: buyer@test.com</p>
                  <p className="text-muted-foreground">Password: buyer123</p>
                </div>
              </TabsContent>

              <TabsContent value="seller" className="mt-6">
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-semibold mb-2">Demo Seller Account:</p>
                  <p className="text-muted-foreground">Email: seller@test.com</p>
                  <p className="text-muted-foreground">Password: seller123</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          This is a demo application. Backend integration coming soon.
        </p>
      </div>
    </div>
  );
};

export default SignIn;

