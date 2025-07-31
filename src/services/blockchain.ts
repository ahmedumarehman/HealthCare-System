// Blockchain service for handling Web3 interactions
export class BlockchainService {
  private web3: any;
  private contracts: Record<string, any> = {};

  constructor() {
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.web3 = (window as any).ethereum;
    }
  }

  async connectWallet(): Promise<{address: string, chainId: number}> {
    try {
      if (!this.web3) {
        throw new Error('MetaMask not found');
      }

      const accounts = await this.web3.request({
        method: 'eth_requestAccounts',
      });

      const chainId = await this.web3.request({
        method: 'eth_chainId',
      });

      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16)
      };
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    // MetaMask doesn't have a disconnect method, but we can clear local state
    console.log('Wallet disconnected');
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.web3.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      
      // Convert from wei to ETH
      return (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async signMessage(message: string): Promise<string> {
    try {
      const accounts = await this.web3.request({
        method: 'eth_accounts',
      });

      if (accounts.length === 0) {
        throw new Error('No connected accounts');
      }

      const signature = await this.web3.request({
        method: 'personal_sign',
        params: [message, accounts[0]],
      });

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  async storeRecordHash(recordHash: string): Promise<string> {
    // Simulate storing a medical record hash on blockchain
    return new Promise((resolve) => {
      setTimeout(() => {
        const txHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        resolve(txHash);
      }, 2000);
    });
  }

  async verifyRecordHash(recordHash: string): Promise<boolean> {
    // Simulate verifying a record hash on blockchain
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% success rate
      }, 1000);
    });
  }

  async mintMedicalNFT(metadata: any): Promise<string> {
    // Simulate minting a medical NFT
    return new Promise((resolve) => {
      setTimeout(() => {
        const tokenId = Math.floor(Math.random() * 10000).toString();
        resolve(tokenId);
      }, 3000);
    });
  }

  async getTransactionHistory(address: string): Promise<any[]> {
    // Simulate getting transaction history
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockTransactions = [
          {
            hash: '0xabc123def456...',
            type: 'record_upload',
            timestamp: new Date().toISOString(),
            status: 'confirmed',
            gasUsed: '21000',
            blockNumber: 12345678
          },
          {
            hash: '0xdef456abc123...',
            type: 'access_grant',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'confirmed',
            gasUsed: '45000',
            blockNumber: 12345677
          }
        ];
        resolve(mockTransactions);
      }, 1000);
    });
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (this.web3) {
      this.web3.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (this.web3) {
      this.web3.on('chainChanged', callback);
    }
  }
}

export const blockchainService = new BlockchainService();
