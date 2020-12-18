import React from 'react';
import ethers from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import DateTimeFormat = Intl.DateTimeFormat;

export interface IBalances {
  [token: string]: ethers.BigNumberish;
}

export interface IEthBalance {
  address: string;
  balance: number;
  symbol: string;
  id?: number;
}

export interface IContacts {
  name: string;
  address: string;
}

export type IAppProps = {
  children?: React.ReactNode;
};

export interface IHeaderLinks {
  title: string;
  link: string;
}

export interface ITransaction {
  action: (token: string, type?: string) => Promise<void> | boolean;
  input: boolean;
  title: string;
  type?: string;
}

export interface IFooterLinks {
  title: string;
  link: string;
}

export interface IPrice {
  [price: string]: number;
}

export interface IContactNameValue {
  name?: string;
  address?: string;
}
