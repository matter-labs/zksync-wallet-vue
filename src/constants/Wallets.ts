export const WALLETS = {
  'Coinbase Wallet': () => import('../components/Wallets/BrowserWallet'),
  Fortmatic: () => import('../components/Wallets/FortmaticWallet'),
  Metamask: () => import('../components/Wallets/BrowserWallet'),
  Portis: () => import('../components/Wallets/PortisWallet'),
  WalletConnect: () => import('../components/Wallets/WalletConnect'),
};
