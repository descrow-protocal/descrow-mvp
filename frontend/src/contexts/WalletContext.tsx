import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { contract } from '@/lib/contract';

export type WalletType = 'polkadot' | 'metamask';

export interface WalletAccount {
  address: string;
  name?: string;
  balance?: string;
}

interface WalletContextType {
  walletType: WalletType | null;
  account: WalletAccount | null;
  isConnecting: boolean;
  isConnected: boolean;
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  sendTransaction: (amount: number, recipient?: string) => Promise<boolean>;
  switchToMoonbeam: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectPolkadot = async () => {
    const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
    
    const extensions = await web3Enable('Web3 Market');
    
    if (extensions.length === 0) {
      toast.error('Polkadot.js extension not found', {
        description: 'Please install the Polkadot.js extension',
      });
      return false;
    }

    const accounts = await web3Accounts();
    
    if (accounts.length === 0) {
      toast.error('No accounts found', {
        description: 'Please create an account in Polkadot.js extension',
      });
      return false;
    }

    setWalletType('polkadot');
    setAccount({
      address: accounts[0].address,
      name: accounts[0].meta.name,
    });
    
    toast.success('Polkadot wallet connected', {
      description: `Connected to ${accounts[0].meta.name || 'account'}`,
    });
    
    return true;
  };

  const switchToMoonbeam = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask not found');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x507' }],
      });
      toast.success('Switched to Moonbase Alpha');
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x507',
              chainName: 'Moonbase Alpha',
              nativeCurrency: { name: 'DEV', symbol: 'DEV', decimals: 18 },
              rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
              blockExplorerUrls: ['https://moonbase.moonscan.io/'],
            }],
          });
          toast.success('Moonbase Alpha network added');
        } catch (addError: any) {
          toast.error('Failed to add network', { description: addError.message });
        }
      } else {
        toast.error('Failed to switch network', { description: error.message });
      }
    }
  }, []);

  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask not found', {
        description: 'Please install MetaMask extension',
      });
      return false;
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        toast.error('No accounts found', {
          description: 'Please create an account in MetaMask',
        });
        return false;
      }

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      setWalletType('metamask');
      setAccount({
        address: accounts[0],
        balance: (parseInt(balance, 16) / 1e18).toFixed(4),
      });
      
      toast.success('MetaMask connected', {
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
      
      return true;
    } catch (error: any) {
      toast.error('Connection failed', {
        description: error.message || 'Failed to connect to MetaMask',
      });
      return false;
    }
  };

  const connectWallet = useCallback(async (type: WalletType) => {
    setIsConnecting(true);
    
    try {
      if (type === 'polkadot') {
        await connectPolkadot();
      } else if (type === 'metamask') {
        await connectMetaMask();
      }
    } catch (error: any) {
      toast.error('Connection failed', {
        description: error.message || 'Failed to connect wallet',
      });
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWalletType(null);
    setAccount(null);
    toast.info('Wallet disconnected');
  }, []);

  const sendTransaction = useCallback(async (usdAmount: number, sellerAddress?: string): Promise<boolean> => {
    if (!account || !walletType) {
      toast.error('No wallet connected');
      return false;
    }

    const USD_TO_DEV_RATE = parseFloat(import.meta.env.VITE_USD_TO_DEV_RATE || '0.05');
    const devAmount = usdAmount * USD_TO_DEV_RATE;
    // const defaultSeller = '0x15ee0c2e35e55d46c3bbebe87c955afc54c31b24'; // Default seller address

    try {
      if (walletType === 'metamask') {
        const txHash = await contract.createOrder(
          sellerAddress, 
          devAmount, 
          account.address
        );
        toast.success('Order created', { 
          description: `${devAmount.toFixed(4)} DEV (${usdAmount.toFixed(2)} USD)` 
        });
        return true;
      }
      
      toast.error('Polkadot transactions not yet implemented');
      return false;
    } catch (error: any) {
      toast.error('Transaction failed', { description: error.message });
      return false;
    }
  }, [account, walletType]);

  return (
    <WalletContext.Provider
      value={{
        walletType,
        account,
        isConnecting,
        isConnected: !!account,
        connectWallet,
        disconnectWallet,
        sendTransaction,
        switchToMoonbeam,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

