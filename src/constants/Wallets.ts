export type WalletType = keyof typeof WALLETS | '';

export const WALLETS = {
  Injected: () => import('../components/Wallets/BrowserWallet'),
  Metamask: () => import('../components/Wallets/BrowserWallet'),
  WalletConnect: () => import('../components/Wallets/WalletConnect'),
  // 'Coinbase Wallet': () => import('../components/Wallets/BrowserWallet'),  /** TODO: for demo only */
  // Portis: () => import('../components/Wallets/PortisWallet'),
  // Fortmatic: () => import('../components/Wallets/FortmaticWallet'),
};

export const DESKTOP_ONLY_WALLETS = ['Metamask'];
export const MOBILE_ONLY_WALLETS = ['Coinbase Wallet'];
export const BRAVE_NON_WORKING_WALLETS = ['Portis'];
