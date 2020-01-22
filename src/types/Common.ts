import { utils } from 'ethers';

export interface IBalances {
  [token: string]: utils.BigNumberish;
}

export type IAppProps = {
  children?: React.ReactNode;
};
