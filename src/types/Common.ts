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

export interface IHeaderLinks {
  title: string;
  link: string;
}

export interface ITransaction {
  title: string;
  input: boolean;
  action: any;
}

export interface IFooterLinks {
  title: string;
  link: string;
}
