import { CURRENT_NETWORK_PREFIX } from './networks';

export const LINKS_CONFIG = {
  STAGE_ZKSYNC: {
    api: 'stage-api.zksync.dev',
    zkSyncBlockExplorer: 'stage.zksync.dev/explorer',
    ethBlockExplorer: `${CURRENT_NETWORK_PREFIX}.etherscan.io`,
    network: CURRENT_NETWORK_PREFIX,
  },
  PRODUCTION_ZKSYNC: {
    api: `${CURRENT_NETWORK_PREFIX}-api.zksync.dev`,
    zkSyncBlockExplorer: `${CURRENT_NETWORK_PREFIX}.zkscan.io/explorer`,
    ethBlockExplorer: `${CURRENT_NETWORK_PREFIX}.etherscan.io`,
    network: CURRENT_NETWORK_PREFIX,
  },
  MAIN_ZKSYNC: {
    api: 'api.zksync.io',
    zkSyncBlockExplorer: 'zkscan.io/explorer',
    ethBlockExplorer: 'etherscan.io',
    network: 'mainnet',
  },
}.STAGE_ZKSYNC;

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

export const ZK_EXPLORER = `https://${CURRENT_NETWORK_PREFIX}.zkscan.io/explorer/transactions`;
export const ETHERSCAN_EXPLORER = `https://${CURRENT_NETWORK_PREFIX}.etherscan.io/tx`;
