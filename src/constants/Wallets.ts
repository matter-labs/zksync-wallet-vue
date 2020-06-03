export type WalletType = keyof typeof WALLETS | '';

export const WALLETS = {
  Web3: () => import('../components/Wallets/BrowserWallet'),
  Metamask: () => import('../components/Wallets/BrowserWallet'),
  WalletConnect: () => import('../components/Wallets/WalletConnect'),
  BurnerWallet: () => import('../components/Wallets/BurnerWallet'),
  // 'Coinbase Wallet': () =>
  //   import('../components/Wallets/BrowserWallet'),
  Portis: () => import('../components/Wallets/PortisWallet'),
  Fortmatic: () => import('../components/Wallets/FortmaticWallet'),
};

export const DESKTOP_ONLY_WALLETS = ['Metamask', 'WalletConnect'];
export const MOBILE_ONLY_WALLETS = [];
export const BRAVE_NON_WORKING_WALLETS = ['Portis'];
