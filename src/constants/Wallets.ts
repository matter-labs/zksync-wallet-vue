export type WalletType = keyof typeof WALLETS | '' | string;

export const WALLETS = {
  Web3: () => import('../components/Wallets/BrowserWallet'),
  Metamask: () => import('../components/Wallets/BrowserWallet'),
  // Portis: () => import('../components/Wallets/PortisWallet'),
  // Fortmatic: () => import('../components/Wallets/FortmaticWallet'),
  BurnerWallet: () => import('../components/Wallets/BurnerWallet'),
  WalletConnect: () => import('../components/Wallets/WalletConnect'),
  // 'Coinbase Wallet': () =>
  //   import('../components/Wallets/BrowserWallet'),
};

export const DESKTOP_ONLY_WALLETS = ['Metamask'];
export const MOBILE_ONLY_WALLETS = [];
export const BRAVE_NON_WORKING_WALLETS = ['Portis'];
