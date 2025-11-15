import { useState } from 'react';
import { Package, Wallet, User, LogOut, Settings, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { CartDrawer } from './CartDrawer';
import { WalletSelectionModal } from './WalletSelectionModal';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { account, isConnected, disconnectWallet } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleLogout = () => {
    logout();
    if (isConnected) {
      disconnectWallet();
    }
    navigate('/');
  };

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <Package className="h-6 w-6 text-primary" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Web3 Market
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/30">
                TESTNET
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {/* Cart - Always visible */}
            <CartDrawer />

            {!isAuthenticated ? (
              /* Sign In Button - When not authenticated */
              <Button
                variant="default"
                onClick={() => navigate('/signin')}
                className="bg-gradient-to-r from-primary to-accent"
              >
                Sign In
              </Button>
            ) : (
              /* Authenticated User Menu */
              <>
                {/* Connect Wallet Button - Only for buyers */}
                {user?.userType === 'buyer' && (
                  <Button
                    variant={isConnected ? 'outline' : 'default'}
                    onClick={() => setShowWalletModal(true)}
                    className={isConnected ? '' : 'bg-gradient-to-r from-primary to-accent'}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        <span className="hidden sm:inline">
                          {account?.address.slice(0, 6)}...{account?.address.slice(-4)}
                        </span>
                        <span className="sm:hidden">Connected</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                )}

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                          {user?.userType} Account
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {user?.userType === 'buyer' && (
                      <DropdownMenuItem onClick={() => navigate('/orders')}>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Orders</span>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Account Settings</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </nav>

      <WalletSelectionModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />
    </>
  );
};
