import { Wallet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet, type WalletType } from '@/contexts/WalletContext';

interface WalletSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletSelectionModal = ({ open, onOpenChange }: WalletSelectionModalProps) => {
  const { connectWallet, isConnecting } = useWallet();

  const handleConnect = async (type: WalletType) => {
    await connectWallet(type);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>
            Choose your preferred wallet to connect
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => handleConnect('polkadot')}
            disabled={isConnecting}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">Polkadot.js</div>
              <div className="text-xs text-muted-foreground">
                Connect with Polkadot extension
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
              <svg viewBox="0 0 40 40" className="h-6 w-6">
                <path fill="#fff" d="M32.5 5l-11 8.2 2-4.8L32.5 5z"/>
                <path fill="#fff" d="M7.5 5l10.9 8.3-1.9-4.9L7.5 5zM27.8 28.3l-2.9 4.4 6.2 1.7 1.8-6-5.1-.1zM7.2 28.4l1.8 6 6.2-1.7-2.9-4.4-5.1.1z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold">MetaMask</div>
              <div className="text-xs text-muted-foreground">
                Connect with MetaMask (Moonbeam compatible)
              </div>
            </div>
          </Button>
        </div>

        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold mb-1">Note:</p>
          <p>
            We're transitioning to Moonbeam chain. MetaMask will be the primary wallet for production.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

