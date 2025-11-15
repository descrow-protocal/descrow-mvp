import { useState, useCallback } from 'react';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { toast } from 'sonner';

export const usePolkadot = () => {
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const extensions = await web3Enable('Web3 Market');
      
      if (extensions.length === 0) {
        toast.error('Polkadot.js extension not found', {
          description: 'Please install the Polkadot.js extension',
        });
        setIsConnecting(false);
        return;
      }

      const accounts = await web3Accounts();
      
      if (accounts.length === 0) {
        toast.error('No accounts found', {
          description: 'Please create an account in Polkadot.js extension',
        });
        setIsConnecting(false);
        return;
      }

      setAccount(accounts[0]);
      toast.success('Wallet connected', {
        description: `Connected to ${accounts[0].meta.name || 'account'}`,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: 'Please try again',
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    toast.info('Wallet disconnected');
  }, []);

  const sendTransaction = useCallback(async (amount: number) => {
    if (!account) {
      toast.error('No wallet connected');
      return;
    }

    try {
      // Placeholder for actual transaction logic
      // In production, this would interact with the escrow smart contract
      toast.loading('Processing transaction...', { id: 'tx' });
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Transaction successful!', {
        id: 'tx',
        description: `Payment of $${amount.toFixed(2)} processed through escrow`,
      });
      
      return true;
    } catch (error) {
      console.error('Transaction error:', error);
      toast.error('Transaction failed', {
        id: 'tx',
        description: 'Please try again',
      });
      return false;
    }
  }, [account]);

  return {
    account,
    isConnecting,
    connectWallet,
    disconnectWallet,
    sendTransaction,
  };
};
