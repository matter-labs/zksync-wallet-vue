import { utils } from 'ethers';

export interface IBalances {
  [token: string]: utils.BigNumberish;
}

export interface IEthBalance {
  address: string;
  balance: number;
  symbol: string;
}

export type IAppProps = {
  children?: React.ReactNode;
};

export interface HeaderLinks {
  title: string;
  link: string;
}
