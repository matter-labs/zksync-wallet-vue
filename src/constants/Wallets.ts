export const WALLETS = {
  Metamask: () => import('../components/Wallets/BrowserWallet'),
  WalletConnect: () => import('../components/Wallets/WalletConnect'),
  'Coinbase Wallet': () => import('../components/Wallets/BrowserWallet'),
  Portis: () => import('../components/Wallets/PortisWallet'),
  Fortmatic: () => import('../components/Wallets/FortmaticWallet'),
};
