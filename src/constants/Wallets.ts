import * as dotenv from 'dotenv';
import Fortmatic from 'fortmatic';
import Portis from '@portis/web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';

dotenv.config();

dotenv.config({ path: `${__dirname}/../../../.env` });

const fm = new Fortmatic(process.env.REACT_APP_FORTMATIC);
const fmProvider = fm.getProvider();
const fmWeb3 = new Web3(fmProvider);
const portis = new Portis(process.env.REACT_APP_PORTIS || '', 'mainnet');
const portisProvider = portis.provider;
const portisWeb3 = new Web3(portisProvider);
const wcProvider = new WalletConnectProvider({
  infuraId: process.env.REACT_APP_WALLET_CONNECT,
});

export const WALLETS = [
  { name: 'Metamask', signUp: window['ethereum']?.enable, provider: window['ethereum'] },
  { name: 'Fortmatic', signUp: fmWeb3.eth.getAccounts, provider: fmProvider },
  { name: 'Portis', signUp: portisWeb3.eth.getAccounts, provider: portisProvider },
  { name: 'WalletConnect', signUp: wcProvider.enable.bind(wcProvider), provider: wcProvider },
  {
    name: 'Coinbase Wallet',
    signUp: window['ethereum']?.enable.bind(window['ethereum']),
    provider: window['ethereum'],
  },
];
