import { IEthBalance } from '../../types/Common';

export interface IMyWallet {
  balances: IEthBalance[];
  price: number;
  title: string;
}
