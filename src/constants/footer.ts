import { IFooterLinks } from '../types/Common';
import { CURRENT_NETWORK_PREFIX } from 'constants/networks';
import { COMMON, LINKS_CONFIG } from './links';

export const FOOTER_LINKS: IFooterLinks[] = [
  COMMON.ABOUT,
  {
    title: 'Block explorer',
    link: `https://${LINKS_CONFIG.STAGE_ZKSYNC.zkSyncBlockExplorer}`,
  },
  COMMON.TERMS,
  COMMON.PRIVACY_POLICY,
];
