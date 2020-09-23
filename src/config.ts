import { CURRENT_NETWORK_PREFIX, RIGHT_NETWORK_ID } from 'constants/networks';

export const DESKTOP_WALLETS = ['Metamask'];
export const MOBILE_WALLETS = ['Coinbase Wallet'];

export const MAX_DEPOSIT_TIME = 200;
export const MAX_WITHDRAWAL_TIME = 10800;

export const LINKS_CONFIG = {
  api: process.env.REACT_APP_ZKSYNC_API_LINK || 'stage-api.zksync.dev',
  zkSyncBlockExplorer:
    process.env.REACT_APP_ZKSYNC_BLOCK_EXPLORER || 'stage.zksync.dev/explorer',
  ethBlockExplorer:
    process.env.REACT_APP_ETH_BLOCK_EXPLORER ||
    `${CURRENT_NETWORK_PREFIX}.etherscan.io`,
  network: process.env.REACT_APP_CURRENT_NETWORK || CURRENT_NETWORK_PREFIX,
  ws_api: process.env.REACT_APP_WS_API || 'wss://stage-api.zksync.dev/jsrpc-ws',
  networkId: process.env.REACT_APP_CURRENT_NETWORK_ID || RIGHT_NETWORK_ID,
  lastGitCommitHash: process.env.REACT_APP_GIT_REVISION || 1,
};

export const NETWORKS_LIST = {
  '1': 'Ethereum Main Network',
  '2': 'Morden Test network',
  '3': 'Ropsten Test Network',
  '4': 'Rinkeby Test Network',
  '5': 'Goerli Test Network',
  '42': 'Kovan Test Network',
};

export const ETH_MINT_ADDRESS =
  LINKS_CONFIG.network === 'rinkeby'
    ? 'https://faucet.rinkeby.io/'
    : 'https://faucet.ropsten.be/';

export const FAUCET_TOKEN_API = `https://${
  LINKS_CONFIG.api === 'stage-api.zksync.dev' ? 'stage' : LINKS_CONFIG.network
}-faucet.zksync.dev`;

export const WITHDRAWAL_PROCESSING_TIME_ENDPOINT = 'withdrawal_processing_time';

export const WITHDRAWAL_PROCESSING_TIME_LINK = `https://${LINKS_CONFIG.api}/api/v0.1/${WITHDRAWAL_PROCESSING_TIME_ENDPOINT}`;

export const RIGHT_NETWORK_NAME = NETWORKS_LIST[LINKS_CONFIG.networkId];

export const RECAPTCHA_SITE_KEY = '6LdEBqUZAAAAAMAr2XDTxJHuXOxpQ7rfkn2BBfUo';

export const INFURA_ID = '85d8408593834bf6889554d624be0193';
export const AUTOLOGIN_WALLETS = [
  'Metamask',
  'WalletConnect',
  'Portis',
  'Fortmatic',
  'Coinbase Wallet',
];

export const COMMON = {
  ABOUT: {
    title: 'About',
    link: 'https://docs.zksync.io/',
  },
  TERMS: {
    title: 'Terms of Use',
    link: 'https://zksync.io/legal/terms.html',
  },
  PRIVACY_POLICY: {
    title: 'Privacy Policy',
    link: 'https://zksync.io/legal/privacy.html',
  },
  DOCS: {
    title: 'Docs',
    link: '//zksync.io/faq/intro.html',
  },
  CONTACTS: {
    title: 'Contact',
    link: '//zksync.io/contact.html',
  },
};
