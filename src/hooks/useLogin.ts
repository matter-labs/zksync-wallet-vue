import { InjectedConnector } from '@web3-react/injected-connector';

import { RIGHT_NETWORK_ID } from 'constants/networks';

export const injected = new InjectedConnector({
  supportedChainIds: [parseInt(RIGHT_NETWORK_ID)],
});
