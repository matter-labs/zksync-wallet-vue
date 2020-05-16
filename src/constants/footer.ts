import { IFooterLinks } from '../types/Common';
import { CURRENT_NETWORK_PREFIX } from 'constants/networks';

export const FOOTER_LINKS: IFooterLinks[] = [
  {
    title: 'About',
    link: 'https://docs.zksync.io/',
  },
  {
    title: 'Block explorer',
    link: `https://${CURRENT_NETWORK_PREFIX}.zkscan.io/explorer/`,
  },
  {
    title: 'Terms of Use',
    link: 'https://zksync.io/legal/terms.html',
  },
  {
    title: 'Privacy Policy',
    link: 'https://zksync.io/legal/privacy.html',
  },
];
