import { InjectedConnector } from '@web3-react/injected-connector';

import { LINKS_CONFIG } from 'src/config';

export const injected = new InjectedConnector({
  supportedChainIds: [parseInt(LINKS_CONFIG.networkId)],
});
